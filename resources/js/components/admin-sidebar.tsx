import * as React from "react"
import {
  IconDashboard,
  IconListDetails,
  IconPrinter,
  IconReceipt,
  IconSettings,
  IconShirt,
  IconUsers,
  IconPalette
} from "@tabler/icons-react"
import { Link, usePage } from "@inertiajs/react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { url } = usePage<any>();
  const user = usePage<any>().props.auth.user;

  const isActive = (href: string) => {
    if (href === '/admin') return url === '/admin' || url === '/admin/';
    return url.startsWith(href);
  };

  const navGroups = [
    {
      title: "Tinjauan Utama",
      items: [
        { title: "Dashboard", url: "/admin", icon: IconDashboard },
        { title: "Pelanggan", url: "/admin/customers", icon: IconUsers },
      ]
    },
    {
      title: "Penjualan & Transaksi",
      items: [
        { title: "Daftar Pesanan", url: "/admin/orders", icon: IconListDetails },
        { title: "Keuangan & Tagihan", url: "/admin/invoices", icon: IconReceipt },
      ]
    },
    {
      title: "Master Data Produksi",
      items: [
        { title: "Katalog Produk", url: "/admin/products", icon: IconShirt },
        { title: "Bahan Material", url: "/admin/materials", icon: IconPalette },
        { title: "Metode Cetak", url: "/admin/print-methods", icon: IconPrinter },
      ]
    },
    {
      title: "Lainnya",
      items: [
        { title: "Pengaturan Sistem", url: "#", icon: IconSettings },
      ]
    }
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconPrinter className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Sablonku Admin</span>
                  <span className="text-xs">v2.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={{
            name: user?.name || 'Administrator',
            email: user?.email || 'admin@sablon.com',
            avatar: ''
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
