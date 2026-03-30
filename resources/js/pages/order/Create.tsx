import { useState, useMemo, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';


import { store } from '@/routes/order';
import { login } from '@/routes';

interface Tier { id: number; min_qty: number; max_qty: number; price: string }
interface Material { id: number; name: string; additional_price: string }
interface PrintMethod { id: number; name: string; additional_price: string }
interface Product { id: number; name: string; price_tiers: Tier[]; materials: Material[]; print_methods: PrintMethod[]; is_active: boolean; }
interface PaymentMethod { id: number; name: string; type: string; account_number: string; account_name: string; logo_url: string; }

export default function CreateOrder({
    products,
    prefill
}: {
    products: Product[],
    prefill: any
}) {
    // Default select first product
    const defaultProduct = products.length > 0 ? products[0] : null;

    const { data, setData, post, processing, errors } = useForm({
        name: prefill?.name || '',
        email: prefill?.email || '',
        phone: prefill?.phone || '',
        address: prefill?.address || '',
        delivery_method: 'kirim_kurir' as 'kirim_kurir' | 'ambil_sendiri',
        product_id: defaultProduct?.id || '',
        material_id: defaultProduct?.materials?.[0]?.id || '',
        print_method_id: defaultProduct?.print_methods?.[0]?.id || '',
        sizes: [
            { id: 1, size: 'M', sleeve: 'short', qty: 5 },
            { id: 2, size: 'L', sleeve: 'short', qty: 5 },
            { id: 3, size: 'XL', sleeve: 'short', qty: 2 }
        ],
        notes: ''
    });

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(defaultProduct);

    // Update selected product when product_id changes
    useEffect(() => {
        if (data.product_id) {
            const prod = products.find(p => p.id === data.product_id);
            if (prod) {
                setSelectedProduct(prod);
                // Reset materials and print methods to the new product's defaults if the old ones aren't available
                const matExists = prod.materials.find(m => m.id === data.material_id);
                if (!matExists) setData('material_id', prod.materials[0]?.id || '');

                const pmExists = prod.print_methods.find(p => p.id === data.print_method_id);
                if (!pmExists) setData('print_method_id', prod.print_methods[0]?.id || '');
            }
        }
    }, [data.product_id, products]);

    // Derived state calculations
    const totalQty = useMemo(() => data.sizes.reduce((sum, s) => sum + s.qty, 0), [data.sizes]);

    const basePrice = useMemo(() => {
        if (!selectedProduct || !selectedProduct.price_tiers) return 0;
        const tier = selectedProduct.price_tiers.find(t => totalQty >= t.min_qty && totalQty <= t.max_qty);
        // Fallback to highest tier
        const highestTier = [...selectedProduct.price_tiers].sort((a, b) => b.min_qty - a.min_qty)[0];
        return tier ? parseFloat(tier.price) : (highestTier ? parseFloat(highestTier.price) : 0);
    }, [totalQty, selectedProduct]);

    const materialPrice = useMemo(() => {
        const mat = selectedProduct?.materials?.find(m => m.id === data.material_id);
        return mat ? parseFloat(mat.additional_price) : 0;
    }, [data.material_id, selectedProduct]);

    const printPrice = useMemo(() => {
        const pm = selectedProduct?.print_methods?.find(p => p.id === data.print_method_id);
        return pm ? parseFloat(pm.additional_price) : 0;
    }, [data.print_method_id, selectedProduct]);

    // Format currency
    const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    // Subtotal calculations logic
    const subtotal = useMemo(() => {
        let sum = 0;
        data.sizes.forEach(sz => {
            const baseAndMaterials = basePrice + materialPrice + printPrice;
            const sleeveFee = sz.sleeve === 'long' ? 5000 : 0;
            const sizeFee = ['XXL', 'XXXL'].includes(sz.size) ? 5000 : 0;
            const pricePerItem = baseAndMaterials + sleeveFee + sizeFee;
            sum += (pricePerItem * sz.qty);
        });
        return sum;
    }, [data.sizes, basePrice, materialPrice, printPrice]);

    const shippingFee = data.delivery_method === 'kirim_kurir' ? 20000 : 0;
    const totalAmount = subtotal + shippingFee;
    const dpRequired = totalAmount * 0.5;

    const handleUpdateQty = (id: number, val: number) => {
        if (val < 0) return;
        setData('sizes', data.sizes.map(s => s.id === id ? { ...s, qty: val } : s));
    };

    const handleAddSize = () => {
        const newId = Math.max(0, ...data.sizes.map(s => s.id)) + 1;
        setData('sizes', [...data.sizes, { id: newId, size: 'M', sleeve: 'short', qty: 1 }]);
    };

    const handleRemoveSize = (id: number) => {
        if (data.sizes.length > 1) {
            setData('sizes', data.sizes.filter(s => s.id !== id));
        }
    };

    const handleSizeChange = (id: number, field: 'size' | 'sleeve', val: string) => {
        setData('sizes', data.sizes.map(s => s.id === id ? { ...s, [field]: val } : s));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 px-4 py-12 selection:bg-rose-500 selection:text-white pb-24">
            <Head title="Buat Pesanan Sablon" />

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="md:col-span-2 space-y-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Buat Pesanan.</h1>
                        <p className="text-neutral-400 mt-2 text-lg">Sesuaikan pesanan Anda dan dapatkan estimasi biaya real-time.</p>
                        {prefill?.role === 'reseller' && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-500/20">
                                <span className="font-semibold text-sm">✓ Login sebagai Reseller.</span> Harga diskon otomatis diterapkan.
                            </div>
                        )}
                        {!prefill && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-slate-800 text-slate-300 px-4 py-2 rounded-lg border border-slate-700">
                                <span className="text-sm">Anda reseller? <a href={login.url()} className="text-rose-400 underline">Login disini</a> untuk harga khusus.</span>
                            </div>
                        )}
                    </div>

                    <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xl shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-neutral-200">Data Pemesan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-neutral-400">Nama Lengkap</Label>
                                    <Input
                                        className="bg-neutral-950 border-neutral-800"
                                        value={data.name} onChange={e => setData('name', e.target.value)} required
                                    />
                                    {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-neutral-400">Nomor WhatsApp</Label>
                                    <Input
                                        type="tel" className="bg-neutral-950 border-neutral-800"
                                        value={data.phone} onChange={e => setData('phone', e.target.value)} required
                                    />
                                    {errors.phone && <div className="text-red-500 text-xs">{errors.phone}</div>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-neutral-400">Email Utama</Label>
                                    <Input
                                        type="email" className="bg-neutral-950 border-neutral-800"
                                        value={data.email} onChange={e => setData('email', e.target.value)} required
                                    />
                                    {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xl shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-neutral-200">Spesifikasi Sablon</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-neutral-400">Pilih Bahan Kaos</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {selectedProduct?.materials?.map(m => (
                                        <div
                                            key={m.id}
                                            onClick={() => setData('material_id', m.id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${data.material_id === m.id ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'}`}
                                        >
                                            <p className="font-semibold">{m.name}</p>
                                            <p className="text-xs text-neutral-500 mt-1">{parseFloat(m.additional_price) > 0 ? `+${formatRp(parseFloat(m.additional_price))}` : 'Gratis'}</p>
                                        </div>
                                    ))}
                                </div>
                                {errors.material_id && <div className="text-red-500 text-xs">{errors.material_id}</div>}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-neutral-400">Jenis Sablon</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {selectedProduct?.print_methods?.map(pm => (
                                        <div
                                            key={pm.id}
                                            onClick={() => setData('print_method_id', pm.id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${data.print_method_id === pm.id ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'}`}
                                        >
                                            <p className="font-semibold">{pm.name}</p>
                                            <p className="text-xs text-neutral-500 mt-1">{parseFloat(pm.additional_price) > 0 ? `+${formatRp(parseFloat(pm.additional_price))}` : (parseFloat(pm.additional_price) < 0 ? formatRp(parseFloat(pm.additional_price)) : 'Gratis')}</p>
                                        </div>
                                    ))}
                                </div>
                                {errors.print_method_id && <div className="text-red-500 text-xs">{errors.print_method_id}</div>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xl shadow-2xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-neutral-200">Breakdown Ukuran & Lengan</CardTitle>
                                <CardDescription className="text-neutral-400 mt-1">Total: <Badge variant="secondary" className="ml-2 font-mono bg-neutral-800 text-white">{totalQty} pcs</Badge></CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.sizes.map(sz => (
                                <div key={sz.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                                    <div className="flex flex-wrap gap-2 flex-1 w-full sm:w-auto">
                                        <select
                                            className="bg-neutral-900 border border-neutral-800 rounded-md text-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-rose-500 text-white"
                                            value={sz.size}
                                            onChange={(e) => handleSizeChange(sz.id, 'size', e.target.value)}
                                        >
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                            <option value="XXL">XXL (+Rp5k)</option>
                                            <option value="XXXL">XXXL (+Rp5k)</option>
                                        </select>
                                        <select
                                            className="bg-neutral-900 border border-neutral-800 rounded-md text-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                                            value={sz.sleeve}
                                            onChange={(e) => handleSizeChange(sz.id, 'sleeve', e.target.value)}
                                        >
                                            <option value="short">Lengan Pendek</option>
                                            <option value="long">Lengan Panjang (+Rp5k)</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t border-neutral-800 sm:border-0 pt-3 sm:pt-0">
                                        <div className="flex items-center gap-2">
                                            <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full border-neutral-700 bg-neutral-900" onClick={() => handleUpdateQty(sz.id, sz.qty - 1)}>-</Button>
                                            <span className="w-8 text-center font-mono">{sz.qty}</span>
                                            <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full border-neutral-700 bg-neutral-900" onClick={() => handleUpdateQty(sz.id, sz.qty + 1)}>+</Button>
                                        </div>
                                        {data.sizes.length > 1 && (
                                            <Button type="button" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 px-2 ml-2" onClick={() => handleRemoveSize(sz.id)}>Hapus</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {errors.sizes && <div className="text-red-500 text-xs">{errors.sizes as string}</div>}
                            <Button type="button" variant="ghost" className="w-full border border-dashed border-neutral-800 hover:bg-neutral-800/50 text-neutral-400" onClick={handleAddSize}>
                                + Tambah Variasi Ukuran
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xl shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-neutral-200">Pengiriman & Catatan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setData('delivery_method', 'kirim_kurir')}
                                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${data.delivery_method === 'kirim_kurir' ? 'border-sky-500 bg-sky-500/10' : 'border-neutral-800 hover:border-neutral-700'}`}
                                >
                                    <div>
                                        <p className="font-semibold">Kirim via Kurir</p>
                                        <p className="text-xs text-neutral-500">Reguler (2-3 Hari)</p>
                                    </div>
                                </div>
                                <div
                                    onClick={() => setData('delivery_method', 'ambil_sendiri')}
                                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${data.delivery_method === 'ambil_sendiri' ? 'border-sky-500 bg-sky-500/10' : 'border-neutral-800 hover:border-neutral-700'}`}
                                >
                                    <div>
                                        <p className="font-semibold">Ambil Sendiri</p>
                                        <p className="text-xs text-emerald-400 mt-1">Gratis Ongkir</p>
                                    </div>
                                </div>
                            </div>

                            {data.delivery_method === 'kirim_kurir' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                                    <Label className="text-neutral-400">Alamat Lengkap Pengiriman</Label>
                                    <Textarea
                                        className="bg-neutral-950 border-neutral-800 min-h-[100px]"
                                        value={data.address} onChange={(e: any) => setData('address', e.target.value)}
                                        placeholder="Nama Jalan, Gedung, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
                                        required
                                    />
                                    {errors.address && <div className="text-red-500 text-xs">{errors.address}</div>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-neutral-400">Catatan Order (Opsional)</Label>
                                <Textarea
                                    className="bg-neutral-950 border-neutral-800"
                                    value={data.notes} onChange={(e: any) => setData('notes', e.target.value)}
                                    placeholder="Warna kaos, instruksi khusus sablon, dll"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hidden submit button to allow form submission logic to work via summary button */}
                    <button type="submit" id="submit-form" className="hidden">Submit</button>

                </form>

                {/* Summary Section */}
                <div className="md:col-span-1">
                    <div className="sticky top-12 z-10">
                        <Card className="border-neutral-800 bg-neutral-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
                            <div className="h-2 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 w-full"></div>
                            <CardHeader>
                                <CardTitle className="text-neutral-200">Ringkasan Order</CardTitle>
                                <CardDescription className="text-neutral-400 mt-1">Estimasi biaya berdasarkan kriteria pilihan.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-neutral-400">
                                        <span>Harga Grosir (Tier x{totalQty})</span>
                                        <span className="text-neutral-200">{formatRp(basePrice)} <span className="text-[10px]">/pcs</span></span>
                                    </div>
                                    <div className="flex justify-between text-neutral-400 border-t border-neutral-800 pt-2">
                                        <span>Subtotal Kaos & Sablon</span>
                                        <span className="text-neutral-200 font-medium">{formatRp(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-400">
                                        <span>Estimasi Ongkir</span>
                                        <span className="text-neutral-200">{formatRp(shippingFee)}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-neutral-800">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-neutral-300 font-medium">Grand Total</span>
                                        <span className="text-2xl font-black bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">{formatRp(totalAmount)}</span>
                                    </div>

                                    <div className="flex justify-between items-center mt-4 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                                        <div>
                                            <p className="text-orange-400 font-semibold text-sm">Wajib DP (50%)</p>
                                        </div>
                                        <span className="text-orange-400 font-bold">{formatRp(dpRequired)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full h-12 text-md font-bold bg-white text-black hover:bg-neutral-200 transition-colors"
                                    onClick={() => document.getElementById('submit-form')?.click()}
                                    disabled={processing || totalQty < 1}
                                >
                                    {processing ? 'Memproses...' : 'Buat Pesanan & Lanjut Bayar'}
                                </Button>
                            </CardFooter>
                        </Card>

                    </div>
                </div>

            </div>
        </div>
    );
}
