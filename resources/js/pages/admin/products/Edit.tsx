import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PremiumBanner } from '@/components/premium-banner';
import {
    ArrowLeft, Box, Check, CircleDollarSign, Save,
    Layers, Palette, Plus, Printer, Trash2, Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Edit({ product }: { product: any }) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name || '',
        description: product.description || '',
        is_active: product.is_active !== undefined ? product.is_active : true,
        priceTiers: product.price_tiers || [],
        materials: product.materials || [],
        printMethods: product.print_methods || [],
        image: null as File | null,
    });

    // Preview state for image
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(
        product.image_path ? `/storage/${product.image_path}` : null
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image', file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Build payload — always use forceFormData so File can be included
        const payload: Record<string, any> = {
            _method: 'PUT',
            name: data.name,
            description: data.description,
            is_active: data.is_active ? 1 : 0,
        };

        // Flatten arrays into indexed keys that PHP understands:
        // priceTiers[0][min_qty]=1 etc.
        data.priceTiers.forEach((tier: any, i: number) => {
            payload[`priceTiers[${i}][id]`] = tier.id ?? '';
            payload[`priceTiers[${i}][min_qty]`] = tier.min_qty;
            payload[`priceTiers[${i}][max_qty]`] = tier.max_qty;
            payload[`priceTiers[${i}][price]`] = tier.price;
        });

        data.materials.forEach((mat: any, i: number) => {
            payload[`materials[${i}][id]`] = mat.id ?? '';
            payload[`materials[${i}][name]`] = mat.name;
            payload[`materials[${i}][additional_price]`] = mat.additional_price;
        });

        data.printMethods.forEach((pm: any, i: number) => {
            payload[`printMethods[${i}][id]`] = pm.id ?? '';
            payload[`printMethods[${i}][name]`] = pm.name;
            payload[`printMethods[${i}][additional_price]`] = pm.additional_price;
        });

        if (data.image) payload['image'] = data.image;

        router.post(`/admin/products/${product.id}`, payload as any, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => toast.success('Produk berhasil disimpan.'),
            onError: (errors) => {
                console.error('Save errors:', errors);
                toast.error('Gagal menyimpan. Cek kembali inputan.');
            },
        });
    };

    const add = (field: 'priceTiers' | 'materials' | 'printMethods', obj: any) =>
        setData(field, [...data[field], obj]);

    const remove = (field: 'priceTiers' | 'materials' | 'printMethods', i: number) =>
        setData(field, data[field].filter((_: any, idx: number) => idx !== i));

    const change = (field: 'priceTiers' | 'materials' | 'printMethods', i: number, key: string, val: any) => {
        const arr = [...data[field]];
        arr[i] = { ...arr[i], [key]: val };
        setData(field, arr);
    };

    return (
        <AdminLayout breadcrumbs={[
            { title: 'Katalog Produk', href: '/admin/products' },
            { title: product.name, href: '#' },
        ]}>
            <Head title={`Kelola: ${product.name}`} />

            <div className="flex flex-1 flex-col p-4 lg:p-6 gap-4 max-w-4xl">
                {/* Page Header */}
                <div className="flex items-start gap-3">
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
                        <Link href="/admin/products"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold truncate">{product.name}</h1>
                        <p className="text-xs text-muted-foreground">ID #{product.id} · Konfigurasi harga, bahan, dan sablon</p>
                    </div>
                    <Badge variant={data.is_active ? 'default' : 'secondary'} className="shrink-0 text-xs">
                        {data.is_active ? 'Aktif' : 'Non-aktif'}
                    </Badge>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="h-9">
                        <TabsTrigger value="general" className="gap-1.5 text-xs">
                            <Box size={13} /> Info Dasar
                        </TabsTrigger>
                        <TabsTrigger value="tiers" className="gap-1.5 text-xs">
                            <CircleDollarSign size={13} /> Harga Bertingkat
                        </TabsTrigger>
                        <TabsTrigger value="materials" className="gap-1.5 text-xs">
                            <Palette size={13} /> Material
                        </TabsTrigger>
                        <TabsTrigger value="print_methods" className="gap-1.5 text-xs">
                            <Printer size={13} /> Metode Sablon
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Tab 1: General ── */}
                    <TabsContent value="general" className="mt-4">
                        <PremiumBanner
                            icon={<Box size={18} />}
                            title="Informasi Dasar Produk"
                            badgeText="General"
                            description="Nama dan deskripsi yang tampil di halaman pemesanan pelanggan."
                        >
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name" className="text-sm font-semibold">Nama Produk</Label>
                                        <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Kaos Cotton Combed 24s" />
                                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="desc" className="text-sm font-semibold">Deskripsi <span className="font-normal text-muted-foreground text-xs">(opsional)</span></Label>
                                        <Input id="desc" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Tersedia pilihan warna..." />
                                    </div>
                                </div>
                                <Separator />
                                {/* Switch Aktif */}
                                <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/30">
                                    <div>
                                        <p className="text-sm font-semibold">Tampilkan di Katalog Pemesanan</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Jika aktif, produk muncul sebagai pilihan saat order baru.</p>
                                    </div>
                                    <Switch
                                        id="active"
                                        checked={data.is_active}
                                        onCheckedChange={v => setData('is_active', v)}
                                    />
                                </div>
                                <Separator />
                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Foto Produk</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                                            {previewUrl
                                                ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                : <ImageIcon size={20} className="text-muted-foreground/30" />
                                            }
                                        </div>
                                        <div className="space-y-1.5">
                                            <Input
                                                id="image"
                                                type="file"
                                                accept="image/jpg,image/jpeg,image/png,image/webp"
                                                onChange={handleImageChange}
                                                className="h-8 text-xs cursor-pointer"
                                            />
                                            <p className="text-xs text-muted-foreground">JPG, PNG, atau WebP. Maks 2MB.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </PremiumBanner>
                    </TabsContent>

                    {/* ── Tab 2: Price Tiers ── */}
                    <TabsContent value="tiers" className="mt-4">
                        <PremiumBanner
                            icon={<Layers size={18} />}
                            title="Harga Berdasarkan Kuantitas"
                            badgeText="Grosir"
                            description="Harga baju polos tergantung jumlah pesanan. Semakin banyak qty, semakin murah per piece."
                            features={[
                                { icon: <Check size={12} />, text: "Auto hitung", iconColor: "text-emerald-500" },
                                { icon: <Check size={12} />, text: "Multi tier", iconColor: "text-emerald-500" },
                            ]}
                        >
                            <div className="space-y-3">
                                {data.priceTiers.length > 0 && (
                                    <div className="hidden grid-cols-[80px_80px_1fr_36px] gap-2 px-1 md:grid">
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Min Qty</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Maks Qty</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Harga / pcs (Rp)</span>
                                        <span />
                                    </div>
                                )}
                                {data.priceTiers.map((tier: any, i: number) => (
                                    <div key={i} className="grid grid-cols-[80px_80px_1fr_36px] gap-2 items-center">
                                        <Input type="number" value={tier.min_qty} onChange={e => change('priceTiers', i, 'min_qty', parseInt(e.target.value))} placeholder="1" className="h-8 text-sm" />
                                        <Input type="number" value={tier.max_qty} onChange={e => change('priceTiers', i, 'max_qty', parseInt(e.target.value))} placeholder="11" className="h-8 text-sm" />
                                        <Input type="number" value={tier.price} onChange={e => change('priceTiers', i, 'price', e.target.value)} placeholder="45000" className="h-8 text-sm" />
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove('priceTiers', i)}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                ))}
                                {!data.priceTiers.length && (
                                    <p className="text-center text-xs text-muted-foreground py-6 border border-dashed rounded-md">
                                        Belum ada tier harga. Produk tidak bisa dipesan jika kosong.
                                    </p>
                                )}
                                <Button type="button" variant="outline" size="sm" className="w-full border-dashed h-8 text-xs mt-1"
                                    onClick={() => add('priceTiers', { id: null, min_qty: 1, max_qty: 12, price: 0 })}>
                                    <Plus size={13} className="mr-1" /> Tambah Jenjang Harga
                                </Button>
                            </div>
                        </PremiumBanner>
                    </TabsContent>

                    {/* ── Tab 3: Materials ── */}
                    <TabsContent value="materials" className="mt-4">
                        <PremiumBanner
                            icon={<Palette size={18} />}
                            title="Variasi Bahan / Material Kain"
                            badgeText="Material"
                            description="Jenis kain yang tersedia untuk produk ini. Setiap bahan bisa memiliki biaya tambahan berbeda."
                        >
                            <div className="space-y-3">
                                {data.materials.length > 0 && (
                                    <div className="hidden grid-cols-[1fr_160px_36px] gap-2 px-1 md:grid">
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Nama Bahan</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">Biaya Tambahan (+Rp)</span>
                                        <span />
                                    </div>
                                )}
                                {data.materials.map((mat: any, i: number) => (
                                    <div key={i} className="grid grid-cols-[1fr_160px_36px] gap-2 items-center">
                                        <Input value={mat.name} onChange={e => change('materials', i, 'name', e.target.value)} placeholder="Cotton Combed 24s" className="h-8 text-sm" />
                                        <Input type="number" value={mat.additional_price} onChange={e => change('materials', i, 'additional_price', e.target.value)} placeholder="0" className="h-8 text-sm" />
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove('materials', i)}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                ))}
                                {!data.materials.length && (
                                    <p className="text-center text-xs text-muted-foreground py-6 border border-dashed rounded-md">
                                        Belum ada bahan. Tambahkan minimal satu variasi kain.
                                    </p>
                                )}
                                <Button type="button" variant="outline" size="sm" className="w-full border-dashed h-8 text-xs mt-1"
                                    onClick={() => add('materials', { id: null, name: '', additional_price: 0 })}>
                                    <Plus size={13} className="mr-1" /> Tambah Bahan Material
                                </Button>
                            </div>
                        </PremiumBanner>
                    </TabsContent>

                    {/* ── Tab 4: Print Methods ── */}
                    <TabsContent value="print_methods" className="mt-4">
                        <PremiumBanner
                            icon={<Printer size={18} />}
                            title="Jenis Jasa Sablon / Cetak"
                            badgeText="Sablon"
                            description="Layanan sablon yang ditawarkan. Harga jasa ditambahkan di atas harga baju dasar."
                        >
                            <div className="space-y-3">
                                {data.printMethods.length > 0 && (
                                    <div className="hidden grid-cols-[1fr_160px_36px] gap-2 px-1 md:grid">
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Jenis Sablon</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-600">Harga Jasa (Rp)</span>
                                        <span />
                                    </div>
                                )}
                                {data.printMethods.map((pm: any, i: number) => (
                                    <div key={i} className="grid grid-cols-[1fr_160px_36px] gap-2 items-center">
                                        <Input value={pm.name} onChange={e => change('printMethods', i, 'name', e.target.value)} placeholder="Print DTF Area A3" className="h-8 text-sm" />
                                        <Input type="number" value={pm.additional_price} onChange={e => change('printMethods', i, 'additional_price', e.target.value)} placeholder="35000" className="h-8 text-sm" />
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove('printMethods', i)}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                ))}
                                {!data.printMethods.length && (
                                    <p className="text-center text-xs text-muted-foreground py-6 border border-dashed rounded-md">
                                        Belum ada metode cetak. Tambahkan layanan sablon yang tersedia.
                                    </p>
                                )}
                                <Button type="button" variant="outline" size="sm" className="w-full border-dashed h-8 text-xs mt-1"
                                    onClick={() => add('printMethods', { id: null, name: '', additional_price: 0 })}>
                                    <Plus size={13} className="mr-1" /> Tambah Metode Sablon
                                </Button>
                            </div>
                        </PremiumBanner>
                    </TabsContent>
                </Tabs>

                {/* Save Button — inline, bukan full screen */}
                <div className="flex items-center gap-3 pt-2">
                    <Button onClick={submit} disabled={processing} size="sm" className="gap-2">
                        <Save size={14} />
                        {processing ? 'Menyimpan...' : 'Simpan Semua'}
                    </Button>
                    <span className="text-xs text-muted-foreground">Semua tab disimpan sekaligus.</span>
                </div>
            </div>
        </AdminLayout>
    );
}
