import { IconTrendingDown, IconTrendingUp, IconPackage, IconReceipt, IconClockHour4, IconTruckDelivery } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
    stats: {
        orders_today: number;
        orders_month: number;
        revenue_today: number | string | null;
        revenue_month: number | string | null;
        pending_payment: number;
        in_production: number;
        ready_to_ship: number;
    }
}

export function SectionCards({ stats }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* CARD 1: REVENUE */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pendapatan Bulan Ini</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Rp {Number(stats?.revenue_month || 0).toLocaleString('id-ID')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Aktif
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Hari ini: Rp {Number(stats?.revenue_today || 0).toLocaleString('id-ID')} <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Berdasarkan invoice lunas
          </div>
        </CardFooter>
      </Card>

      {/* CARD 2: TOTAL PESANAN BULAN INI */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pesanan Bulan Ini</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.orders_month || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPackage />
              Orders
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Hari ini: {stats?.orders_today || 0} Pesanan <IconPackage className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Order masuk selama sebulan
          </div>
        </CardFooter>
      </Card>

      {/* CARD 3: PENDING PAYMENT */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Menunggu Pembayaran</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.pending_payment || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconClockHour4 className="text-amber-500" />
              Pending
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Belum ada konfirmasi DP <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Butuh penagihan via WhatsApp</div>
        </CardFooter>
      </Card>

      {/* CARD 4: SIAP KIRIM */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Siap Dikirim / Ambil</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.ready_to_ship || 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTruckDelivery className="text-green-500" />
              Ready
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Diproses: {stats?.in_production || 0} Pesanan <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Segera atur pengiriman</div>
        </CardFooter>
      </Card>
    </div>
  )
}
