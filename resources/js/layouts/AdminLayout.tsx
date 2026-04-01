import * as React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { AdminSidebar } from '@/components/admin-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';

interface BreadcrumbItemType {
    title: string;
    href: string;
}

interface AdminLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItemType[];
}

export default function AdminLayout({ children, breadcrumbs = [] }: AdminLayoutProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    React.useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <>
        <Toaster position="top-right" richColors />
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AdminSidebar variant="inset" />
            <SidebarInset>
                {/* Header built directly here just like pages/dashboard.tsx uses SiteHeader, but we make it inline for flexibility */}
                <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b px-4 lg:px-6">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb className="flex-1">
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink asChild>
                                    <Link href="/admin">Admin</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            
                            {breadcrumbs.length > 0 && (
                                <BreadcrumbSeparator className="hidden md:block" />
                            )}
                            
                            {breadcrumbs.map((crumb, index) => {
                                const isLast = index === breadcrumbs.length - 1;
                                return (
                                    <React.Fragment key={crumb.href}>
                                        <BreadcrumbItem className="hidden md:block">
                                            {isLast ? (
                                                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink asChild>
                                                    <Link href={crumb.href}>{crumb.title}</Link>
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                                    </React.Fragment>
                                );
                            })}
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </header>

                <div className="flex flex-1 flex-col">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
        </>
    );
}
