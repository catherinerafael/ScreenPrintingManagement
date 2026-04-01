import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuCheckboxItem,
  DropdownMenuContent, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import {
  CheckCircle2, ChevronDown, Columns3, FileText,
  Pencil, Plus, Shirt, Trash2, XCircle, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { PremiumBanner } from '@/components/premium-banner';

interface Product {
  id: number;
  name: string;
  description: string | null;
  image_path: string | null;
  is_active: boolean;
  price_tiers_count: number;
  materials_count: number;
  print_methods_count: number;
}

export default function Index({ products }: { products: Product[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data, setData, post, processing, reset, errors } = useForm({ name: '', description: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/products', {
      onSuccess: () => { setIsCreateOpen(false); reset(); },
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    router.delete(`/admin/products/${deleteTarget.id}`, {
      onSuccess: () => { toast.success('Produk dihapus.'); setDeleteTarget(null); },
    });
  };

  const columns: ColumnDef<Product>[] = [
    {
      id: 'product',
      header: 'Produk',
      cell: ({ row }) => {
        const src = row.original.image_path ? `/storage/${row.original.image_path}` : null;
        return (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden bg-muted border-2 border-border shrink-0 flex items-center justify-center">
              {src
                ? <img src={src} alt={row.original.name} className="w-full h-full object-cover" />
                : <Shirt size={15} className="text-muted-foreground/50" />}
            </div>
            {/* Name + description icon */}
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">{row.original.name}</p>
              {row.original.description && (
                <div className="flex items-center gap-1 mt-0.5">
                  <FileText size={11} className="text-muted-foreground/60 shrink-0" />
                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                    {row.original.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        row.original.is_active ? (
          <Badge variant="outline" className="gap-1.5 text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700 font-semibold">
            <CheckCircle2 size={11} className="text-emerald-500" />
            Aktif
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5 text-rose-500 border-rose-300 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-700 font-semibold">
            <XCircle size={11} className="text-rose-400" />
            Non-aktif
          </Badge>
        )
      ),
    },
    {
      accessorKey: 'price_tiers_count',
      header: 'Harga Tier',
      cell: ({ row }) => (
        row.original.price_tiers_count > 0
          ? <span className="text-xs font-semibold text-emerald-600">{row.original.price_tiers_count} tingkat</span>
          : <span className="text-xs font-semibold text-destructive">Belum diatur</span>
      ),
    },
    {
      accessorKey: 'materials_count',
      header: 'Material',
      cell: ({ row }) => <span className="text-xs font-medium text-muted-foreground">{row.original.materials_count} variasi</span>,
    },
    {
      accessorKey: 'print_methods_count',
      header: 'Sablon',
      cell: ({ row }) => <span className="text-xs font-medium text-muted-foreground">{row.original.print_methods_count} metode</span>,
    },
    {
      id: 'actions',
      header: () => <div className="text-center">Aksi</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-xs font-medium" asChild>
            <Link href={`/admin/products/${row.original.id}/edit`}>
              <Pencil className="mr-1 h-3.5 w-3.5" /> Kelola
            </Link>
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: products, columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <AdminLayout breadcrumbs={[{ title: 'Katalog Produk', href: '/admin/products' }]}>
      <Head title="Katalog Produk" />

      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
            <Shirt className="h-4 w-4" /> Katalog Produk
          </h1>
          <p className="text-xs text-muted-foreground">Kelola produk, harga grosir, bahan, dan sablon.</p>
        </div>

        <PremiumBanner
          icon={<Info size={18} />}
          title="Panduan Manajemen Produk"
          badgeText="Informasi"
          description="Gunakan halaman ini untuk menambah produk baru dan mengubah komponen biayanya. Setelah ditambah, klik tombol 'Kelola' pada tabel untuk mengatur jenjang harga grosir, varian bahan kain, dan opsi spesifik metode cetak agar sistem pemesanan bisa mengkalkulasi total harga secara otomatis dan tetap akurat."
          className="mb-2"
        />

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 text-xs gap-1.5 font-semibold shrink-0">
                <Plus className="h-3.5 w-3.5" /> Tambahkan Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Produk Baru</DialogTitle>
                <DialogDescription>Nama dasar produk. Detail harga & varian diatur di halaman berikutnya.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="p-name" className="text-sm font-semibold">Nama Produk</Label>
                  <Input id="p-name" placeholder="Kaos Cotton Combed, Polo Shirt..." value={data.name} onChange={e => setData('name', e.target.value)} required />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-desc" className="text-sm font-semibold">Deskripsi <span className="font-normal text-muted-foreground">(opsional)</span></Label>
                  <Input id="p-desc" placeholder="Tersedia berbagai warna..." value={data.description} onChange={e => setData('description', e.target.value)} />
                </div>
                <DialogFooter className="pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                  <Button type="submit" size="sm" disabled={processing} className="font-semibold">Buat Produk →</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <div className="flex-1" />

          <Input
            placeholder="Cari produk..."
            value={(table.getColumn('product')?.getFilterValue() as string) ?? ''}
            onChange={e => table.getColumn('product')?.setFilterValue(e.target.value)}
            className="h-8 w-52 text-xs"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 shrink-0">
                <Columns3 className="h-3.5 w-3.5" /> Kolom <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table.getAllColumns().filter(c => c.getCanHide()).map(col => (
                <DropdownMenuCheckboxItem key={col.id} className="text-xs capitalize" checked={col.getIsVisible()} onCheckedChange={v => col.toggleVisibility(!!v)}>
                  {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table — tanpa card wrapper */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(hg => (
                <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                  {hg.headers.map(header => (
                    <TableHead key={header.id} className="text-xs font-bold tracking-wide h-9 px-4">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} className="hover:bg-muted/20 border-b border-border/50">
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="py-2.5 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Shirt className="h-8 w-8 opacity-20" />
                      <span>Belum ada produk. Klik "Tambahkan Produk" untuk memulai.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {table.getPageCount() > 1 && (
            <div className="border-t border-border/50 bg-muted/10 px-4 py-2.5">
              <Pagination>
                <PaginationContent className="text-xs">
                  <PaginationItem>
                    <PaginationPrevious onClick={() => table.previousPage()} className={`h-7 text-xs cursor-pointer ${!table.getCanPreviousPage() ? 'pointer-events-none opacity-40' : ''}`} />
                  </PaginationItem>
                  <PaginationItem className="text-xs text-muted-foreground px-2">
                    Hal {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext onClick={() => table.nextPage()} className={`h-7 text-xs cursor-pointer ${!table.getCanNextPage() ? 'pointer-events-none opacity-40' : ''}`} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk <strong>"{deleteTarget?.name}"</strong> beserta seluruh konfigurasi harga, bahan, dan metode sablon akan <strong>dihapus permanen</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
