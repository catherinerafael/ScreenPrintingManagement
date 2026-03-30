import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { find, confirm } from '@/routes/order';

export default function Track({ order, invoice, errors: serverErrors }: any) {
    const { data, setData, get, processing, errors } = useForm({
        identifier: order?.order_number || ''
    });

    const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(find.url({ identifier: data.identifier }));
    };

    const statuses = [
        { label: 'Pesanan Dibuat', date: order?.created_at, active: !!order?.created_at },
        { label: 'DP Dikonfirmasi', date: order?.dp_paid_at, active: !!order?.dp_paid_at },
        { label: 'Sedang Diproduksi', date: order?.processing_at, active: !!order?.processing_at },
        { label: 'Siap Kirim / Diambil', date: order?.ready_at, active: !!order?.ready_at },
        { label: 'Telah Dikirim', date: order?.shipped_at, active: !!order?.shipped_at },
        { label: 'Selesai', date: order?.completed_at, active: !!order?.completed_at },
    ];

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 px-4 py-12 selection:bg-rose-500 selection:text-white pb-24">
            <Head title="Lacak Pesanan" />

            <div className="max-w-3xl mx-auto space-y-8">
                
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black tracking-tight text-white">Lacak Pesanan.</h1>
                    <p className="text-neutral-400 text-lg">Masukkan Nomor Pesanan (ORD-...) atau Nomor Tagihan (INV-...) Anda.</p>
                </div>

                <form onSubmit={handleSearch} className="flex max-w-md mx-auto gap-2">
                    <Input 
                        placeholder="Contoh: ORD-20261230-001" 
                        value={data.identifier}
                        onChange={e => setData('identifier', e.target.value)}
                        className="bg-neutral-900 border-neutral-800 text-white h-12 text-center text-lg tracking-wider font-mono placeholder:tracking-normal placeholder:text-neutral-600"
                        required
                    />
                    <Button type="submit" disabled={processing} className="h-12 px-6 bg-rose-500 hover:bg-rose-600 text-white font-bold">
                        {processing ? 'Mencari...' : 'Lacak'}
                    </Button>
                </form>
                {(errors.identifier || serverErrors?.identifier) && (
                    <p className="text-center text-red-500 text-sm">{errors.identifier || serverErrors.identifier}</p>
                )}

                {order && (
                    <div className="grid md:grid-cols-2 gap-8 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        
                        {/* Status Timeline */}
                        <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-neutral-200">Status Pesanan</CardTitle>
                                <CardDescription className="text-neutral-400">Order: <span className="text-white font-mono">{order.order_number}</span></CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
                                    {statuses.map((status, idx) => (
                                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-neutral-950 bg-neutral-900 text-neutral-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                                                {status.active ? (
                                                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                                                ) : (
                                                    <div className="w-2 h-2 bg-neutral-700 rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-neutral-950 p-4 rounded-xl border border-neutral-800 shadow-sm relative">
                                                <div className="flex flex-col">
                                                    <span className={`font-semibold ${status.active ? 'text-white' : 'text-neutral-500'}`}>{status.label}</span>
                                                    <span className={`text-xs mt-1 ${status.active ? 'text-emerald-400' : 'text-neutral-600'}`}>
                                                        {formatDate(status.date)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Detail Summary */}
                        <div className="space-y-6">
                            <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-neutral-200">Detail Ringkas</CardTitle>
                                        <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 bg-cyan-500/10">
                                            {order.items?.reduce((acc: number, item: any) => acc + item.qty, 0)} Pcs
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-neutral-500">Pemesan</p>
                                        <p className="text-neutral-200 font-medium">{order.guest_name || order.user?.name || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-neutral-500">Pengiriman</p>
                                        <p className="text-neutral-200 capitalize">{order.delivery_method.replace('_', ' ')}</p>
                                        {order.delivery_method === 'kirim_kurir' && (
                                            <p className="text-sm text-neutral-400 mt-1">{order.shipping_address}</p>
                                        )}
                                        {order.awb_number && (
                                            <p className="text-sm text-orange-400 mt-1 font-mono">Resi: {order.awb_number}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {invoice && (
                                <Card className="border-orange-500/30 bg-orange-500/5 backdrop-blur-xl overflow-hidden relative">
                                    <CardHeader className="pb-3 border-b border-orange-500/10">
                                        <CardTitle className="text-orange-400 text-lg flex items-center justify-between">
                                            <span>Tagihan DP</span>
                                            <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'} className={invoice.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'}>
                                                {invoice.status.toUpperCase()}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-xs text-orange-200/50 font-mono">{invoice.invoice_number}</p>
                                                <p className="text-2xl font-black text-white">{formatRp(invoice.amount)}</p>
                                            </div>
                                            {invoice.status === 'unpaid' && (
                                                <Link href={confirm.url({ orderNumber: order.order_number }, { query: { token: order.guest_token } })} className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors">
                                                    Cara Bayar
                                                </Link>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
