import AdminLayout from '@/layouts/AdminLayout';
import { Head } from '@inertiajs/react';

// Shadcn default dummy components
// We import these as placeholders since the user requested dummy statistics for now
import { SectionCards } from '@/components/section-cards';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import data from '@/data/data.json';

export default function Dashboard() {
    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
            ]}
        >
            <Head title="Dashboard" />

            {/* This follows the structure from pages/dashboard.tsx */}
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {/* Placeholder Section Cards */}
                    <SectionCards stats={{} as any} />

                    {/* Placeholder Chart */}
                    <div className="px-4 lg:px-6">
                        <ChartAreaInteractive data={[]} />
                    </div>

                    {/* Placeholder DataTable */}
                    <DataTable data={[]} />
                </div>
            </div>
        </AdminLayout>
    );
}
