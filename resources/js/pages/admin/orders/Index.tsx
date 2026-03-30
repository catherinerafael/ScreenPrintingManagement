import AdminLayout from '@/layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { DataTable, type RecentOrder } from '@/components/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconPackage } from '@tabler/icons-react';

interface IndexProps {
    orders: {
        data: RecentOrder[];
        current_page: number;
        last_page: number;
        total: number;
    }
}

export default function Index({ orders }: IndexProps) {
    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
                { title: 'Pesanan', href: '/admin/orders' },
            ]}
        >
            <Head title="Manajemen Pesanan" />

            <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
                        <IconPackage className="h-6 w-6" /> Daftar Pesanan
                    </h1>
                </div>

                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle>Total: {orders.total} Pesanan</CardTitle>
                        <CardDescription>
                            Daftar pesanan terbaru dari pelanggan. Gunakan kolom pencarian jika perlu.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* We use our data-table component which provides the client-side tanstack powers over these items */}
                        <DataTable data={orders.data} />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
