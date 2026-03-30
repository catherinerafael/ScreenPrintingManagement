import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IconArrowLeft, IconCheck, IconCreditCard, IconEdit, IconPackage } from '@tabler/icons-react';
import { toast } from 'sonner';

interface OrderProps {
    order: any;
}

const statusOptions = [
    { value: 'pending_payment', label: 'Menunggu Pembayaran' },
    { value: 'paid', label: 'Sudah Dibayar' },
    { value: 'in_production', label: 'Sedang Diproses/Produksi' },
    { value: 'ready_to_ship', label: 'Siap Dikirim / Diambil' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
];

export default function Show({ order }: OrderProps) {
    // FORMATTER
    const formatCurrency = (amount: any) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount || 0);

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    // FORM: UPDATE STATUS
    const { data: statusData, setData: setStatusData, patch: patchStatus, processing: processingStatus } = useForm({
        status: order.status
    });

    const handleUpdateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        patchStatus(`/admin/orders/${order.id}/status`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Status order berhasil diubah.')
        });
    };

    // INVOICE STATE (For editing)
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);

    const { data: invData, setData: setInvData, patch: patchInv, processing: processingInv, reset: resetInv } = useForm({
        invoice_id: '',
        amount: '',
        status: '',
        due_date: '',
        mark_as_paid: false
    });

    const openInvoiceEdit = (inv: any) => {
        setSelectedInvoice(inv);
        setInvData({
            invoice_id: inv.id,
            amount: inv.amount,
            status: inv.status,
            due_date: inv.due_date ? inv.due_date.split('T')[0] : '', // format to YYYY-MM-DD for input type date
            mark_as_paid: false
        });
        setIsInvoiceDialogOpen(true);
    };

    const handleUpdateInvoice = (e: React.FormEvent) => {
        e.preventDefault();
        patchInv(`/admin/orders/${order.id}/invoice`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Invoice berhasil diupdate.');
                setIsInvoiceDialogOpen(false);
                resetInv();
            }
        });
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
                { title: 'Pesanan', href: '/admin/orders' },
                { title: `Order ${order.order_number}`, href: '#' },
            ]}
        >
            <Head title={`Order ${order.order_number}`} />

            <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.get('/admin/orders')}>
                        <IconArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl font-semibold md:text-2xl">Detail Pesanan: {order.order_number}</h1>
                    <Badge variant="outline" className="ml-auto text-sm px-3 py-1">
                        {statusOptions.find(o => o.value === order.status)?.label || order.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: Controls & Invoices */}
                    <div className="flex flex-col gap-6 col-span-1">
                        
                        {/* Status Control */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Update Status Pesanan</CardTitle>
                                <CardDescription>Ubah status operasional secara global</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUpdateStatus} className="flex flex-col gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select 
                                            value={statusData.status} 
                                            onValueChange={(val) => setStatusData('status', val)}
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="submit" disabled={processingStatus}>
                                        <IconCheck className="mr-2 h-4 w-4" /> Simpan Status
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Invoices List */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Daftar Invoice (Tagihan)</CardTitle>
                                <CardDescription>Kelola DP dan pelunasan di sini</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {order.invoices && order.invoices.map((inv: any, idx: number) => (
                                    <div key={inv.id} className="border rounded-lg p-4 flex flex-col gap-2 relative">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold">{inv.invoice_number}</h4>
                                                <p className="text-xs text-muted-foreground uppercase">{inv.type}</p>
                                            </div>
                                            <Badge variant={inv.status === 'paid' ? 'default' : 'destructive'}>
                                                {inv.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                                            </Badge>
                                        </div>
                                        <div className="text-xl font-bold mt-2">
                                            {formatCurrency(inv.amount)}
                                        </div>
                                        {inv.paid_at && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Dibayar pada: {formatDate(inv.paid_at)}
                                            </div>
                                        )}
                                        {/* Edit Invoice Trigger */}
                                        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => openInvoiceEdit(inv)}>
                                            <IconEdit className="mr-2 h-4 w-4" /> Edit Tagihan / Bayar
                                        </Button>
                                    </div>
                                ))}
                                {(!order.invoices || order.invoices.length === 0) && (
                                    <div className="text-center text-sm text-muted-foreground py-4">Belum ada invoice dibuat.</div>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* RIGHT COLUMN: Details & Items */}
                    <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
                        
                        {/* Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informasi Pelanggan</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block mb-1">Nama:</span>
                                    <span className="font-medium">{order.customer?.name || 'Guest'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-1">Email / Kontak:</span>
                                    <span className="font-medium">{order.customer?.email || '-'} / {order.customer?.phone || '-'}</span>
                                </div>
                                <div className="col-span-2 mt-2">
                                    <span className="text-muted-foreground block mb-1">Tanggal Pesan:</span>
                                    <span className="font-medium">{formatDate(order.created_at)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Rincian Order Item</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produk</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Harga Satuan</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items && order.items.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="font-medium">{item.product?.name || `Produk #${item.product_id}`}</div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">{item.notes}</div>
                                                </TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.price_per_item)}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(item.subtotal)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {(!order.items || order.items.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">Item belum ditambahkan.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter className="flex justify-end p-4 border-t bg-muted/20">
                                <div className="grid grid-cols-2 gap-4 text-sm w-full md:w-1/2">
                                    <div className="text-right text-muted-foreground">Subtotal:</div>
                                    <div className="text-right">{formatCurrency(order.subtotal)}</div>
                                    <div className="text-right text-muted-foreground">Biaya Pengiriman:</div>
                                    <div className="text-right">{formatCurrency(order.shipping_cost)}</div>
                                    <div className="text-right text-muted-foreground font-semibold text-lg mt-2">TOTAL:</div>
                                    <div className="text-right font-bold text-lg mt-2">{formatCurrency(order.total_amount)}</div>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>

            {/* DIALOG FOR EDIT INVOICE */}
            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Tagihan {selectedInvoice?.invoice_number}</DialogTitle>
                        <DialogDescription>Sesuaikan nominal DP atau tandai pembayaran lunas (Manual Cash/Transfer).</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateInvoice} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Nominal Tagihan (Rp)</Label>
                            <Input 
                                id="amount" 
                                type="number" 
                                value={invData.amount} 
                                onChange={e => setInvData('amount', e.target.value)} 
                                required
                            />
                            <p className="text-xs text-muted-foreground">Jika ini invoice DP, admin bisa mengurangi/menambah nominal DP jika pelanggan bernegosiasi.</p>
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="inv-status">Status Tagihan</Label>
                            <Select 
                                value={invData.status} 
                                onValueChange={(val) => setInvData('status', val)}
                            >
                                <SelectTrigger id="inv-status">
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unpaid">Belum Lunas</SelectItem>
                                    <SelectItem value="paid">Lunas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {invData.status !== 'paid' && (
                            <div className="flex items-center space-x-2 mt-4 p-3 border rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                                <Checkbox 
                                    id="manual-paid" 
                                    checked={invData.mark_as_paid}
                                    onCheckedChange={(c) => setInvData('mark_as_paid', c === true)}
                                />
                                <Label htmlFor="manual-paid" className="text-sm font-semibold cursor-pointer text-emerald-800 dark:text-emerald-400">
                                    Tandai Lunas Murni (Cash / Manual Transfer)
                                </Label>
                            </div>
                        )}

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsInvoiceDialogOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processingInv}>Simpan Tagihan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </AdminLayout>
    );
}
