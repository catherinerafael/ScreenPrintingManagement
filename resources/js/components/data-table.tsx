import * as React from "react"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconEye,
  IconLayoutColumns,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from "@inertiajs/react"

// Types matching the recentOrders data
export type RecentOrder = {
  id: number
  order_number: string
  created_at: string
  customer?: { name: string } | null
  status: string
  total: number
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const columns: ColumnDef<RecentOrder>[] = [
  {
    accessorKey: "order_number",
    header: "No Order",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("order_number")}</div>
    ),
  },
  {
    id: "customer",
    accessorFn: (row) => row.customer?.name || "Pelanggan Biasa",
    header: "Pelanggan",
    cell: ({ row }) => <div>{row.getValue("customer")}</div>,
  },
  {
    accessorKey: "created_at",
    header: "Tanggal",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at") as string)
      return <div>{date.toLocaleDateString("id-ID")}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      // Simple status badge color map
      const colorMap: Record<string, string> = {
        'pending_payment': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500',
        'paid': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500',
        'in_production': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
        'ready_to_ship': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
        'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
        'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
      }
      return (
        <Badge variant="outline" className={`px-2 py-0.5 capitalize ${colorMap[status] || ""}`}>
          {status.replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      return <div className="text-right font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className="text-right">
          <Button variant="ghost" size="sm" asChild>
             {/* Using Inertia Link correctly with global route method */}
            <Link href={`/admin/orders/${order.id}`}>
              <IconEye className="mr-2 h-4 w-4" />
              Detail
            </Link>
          </Button>
        </div>
      )
    },
  },
]

export function DataTable({ data }: { data: RecentOrder[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  })

  return (
    <div className="flex w-full flex-col justify-start gap-6 pt-4">
      {/* Header toolbar */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h3 className="font-semibold text-lg">Pesanan Terbaru</h3>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns className="mr-2 size-4" />
                Kolom
                <IconChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {typeof column.columnDef.header === 'string' 
                          ? column.columnDef.header 
                          : column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table block */}
      <div className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Tidak ada data pesanan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 lg:px-6 pb-4">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          Menampilkan {table.getRowModel().rows.length} dari {table.getCoreRowModel().rows.length} pesanan
        </div>
        <div className="flex w-full items-center justify-between gap-8 lg:w-fit lg:justify-end">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Halaman sebelumnya</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Halaman selanjutnya</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
