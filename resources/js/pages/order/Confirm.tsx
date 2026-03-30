import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { find } from '@/routes/order';

export default function Confirm({ order, invoice, paymentMethods }: any) {
    const [copied, setCopied] = useState(false);

    // Create tracking link
    const trackUrl = find.url({ identifier: order.order_number });
    const fullTrackUrl = window.location.origin + trackUrl + (order.guest_token ? `?token=${order.guest_token}` : '');

    const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const handleCopy = () => {
        navigator.clipboard.writeText(fullTrackUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-50 px-4 py-12 selection:bg-rose-500 selection:text-white pb-24">
            <Head title={`Konfirmasi Pesanan ${order.order_number}`} />

            <div className="max-w-3xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20 mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white">Pesanan Berhasil Dicatat!</h1>
                    <p className="text-neutral-400 text-lg">Terima kasih, <strong>{order.guest_name || order.user?.name}</strong>. Silakan selesaikan pembayaran DP agar pesanan mulai diproses.</p>
                </div>

                {/* Important Links */}
                <Card className="border-orange-500/30 bg-orange-500/5 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-orange-400 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Simpan Link Tracking Anda
                        </CardTitle>
                        <CardDescription className="text-orange-200/60">Gunakan link ini untuk mengecek status produksi dan pengiriman kapan saja.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex bg-black/40 border border-orange-500/20 rounded-lg overflow-hidden">
                            <input 
                                type="text" 
                                readOnly 
                                value={fullTrackUrl} 
                                className="flex-1 bg-transparent px-4 py-2 text-sm text-neutral-300 outline-none" 
                            />
                            <Button variant="secondary" className="rounded-none bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-l border-orange-500/20" onClick={handleCopy}>
                                {copied ? 'Tersalin!' : 'Salin'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Instructions */}
                <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/5 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <svg className="w-48 h-48 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>

                    <CardHeader className="border-b border-neutral-800 pb-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardDescription className="text-neutral-400 font-medium tracking-widest uppercase text-xs mb-1">INVOICE DP</CardDescription>
                                <CardTitle className="text-white text-2xl font-mono tracking-tight">{invoice.invoice_number}</CardTitle>
                            </div>
                            <Badge variant="outline" className="border-rose-500/50 text-rose-400 bg-rose-500/10 uppercase tracking-wider text-xs px-3 py-1">
                                Menunggu Pembayaran
                            </Badge>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6 grid md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-400 mb-4 uppercase tracking-widest">Detail Tagihan</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-400">Total Order</span>
                                        <span className="text-neutral-200">{formatRp(order.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-800">
                                        <span className="text-white">Wajib DP (50%)</span>
                                        <span className="text-rose-400">{formatRp(invoice.amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-neutral-400 mb-2 uppercase tracking-widest">Metode Pembayaran</h3>
                            {paymentMethods.map((pm: any) => (
                                <div key={pm.id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex flex-col gap-1 hover:border-neutral-700 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-white tracking-wide">{pm.name}</span>
                                        <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 text-[10px] uppercase">
                                            {pm.type.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    {pm.account_number && (
                                        <div className="font-mono text-xl text-emerald-400 mt-1">{pm.account_number}</div>
                                    )}
                                    {pm.account_name && (
                                        <div className="text-sm text-neutral-500">A.N: {pm.account_name}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="bg-black/20 border-t border-neutral-800 p-6 flex-col items-start gap-4">
                        <p className="text-sm text-neutral-400 w-full text-center">
                            Jika sudah transfer, harap konfirmasi via WhatsApp ke Admin dengan melampirkan bukti transfer dan nomor pesanan <strong>{order.order_number}</strong>
                        </p>
                        <div className="w-full flex justify-center">
                            <a href={`https://wa.me/6281234567890?text=Halo Admin, saya sudah transfer DP untuk pesanan ${order.order_number}`} target="_blank" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-emerald-500 text-white shadow-sm hover:bg-emerald-500/90 h-10 px-8 py-2 rounded-md w-full md:w-auto">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                Konfirmasi via WhatsApp
                            </a>
                        </div>
                    </CardFooter>
                </Card>

            </div>
        </div>
    );
}
