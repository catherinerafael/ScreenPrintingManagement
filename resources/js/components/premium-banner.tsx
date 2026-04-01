import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface FeatureItem {
    icon: React.ReactNode
    text: string
    iconColor?: string
}

export interface PremiumBannerProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: React.ReactNode
    title: string
    badgeText?: string
    description: React.ReactNode
    action?: React.ReactNode
    features?: FeatureItem[]
}

export function PremiumBanner({
    icon,
    title,
    badgeText,
    description,
    action,
    features,
    className,
    ...props
}: PremiumBannerProps) {
    return (
        <Card
            className={cn(
                "relative overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl transition-all",
                className
            )}
            {...props}
        >
            {/* Background Gradients */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent opacity-50" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-purple-500/10 via-transparent to-transparent opacity-50" />
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/5 blur-3xl opacity-50" />

            {/* Watermark Icon */}
            {icon && (
                <div className="pointer-events-none absolute -left-6 -top-6 text-primary/5 -rotate-12 z-0">
                    {React.isValidElement(icon)
                        ? React.cloneElement(icon as React.ReactElement<any>, { className: "size-32" })
                        : null}
                </div>
            )}

            <div className="relative z-10 flex flex-col gap-4 p-4 md:flex-row md:items-center md:p-5">
                {/* Left: Icon + Text */}
                <div className="flex flex-1 items-start gap-4">
                    {icon && (
                        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                            {icon}
                        </div>
                    )}
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
                            {badgeText && (
                                <Badge variant="secondary" className="bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/20 text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider border-none">
                                    {badgeText}
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                            {description}
                        </div>
                    </div>
                </div>

                {/* Right: Features + Action */}
                {(features || action) && (
                    <div className="flex w-full items-center justify-between gap-6 border-t border-border/50 pt-4 md:w-auto md:border-t-0 md:pt-0 shrink-0">
                        {features && features.length > 0 && (
                            <div className="hidden items-center gap-5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground lg:flex">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <span className={feature.iconColor || "text-primary"}>{feature.icon}</span>
                                        {feature.text}
                                    </div>
                                ))}
                            </div>
                        )}
                        {action && <div className="shrink-0 w-full md:w-auto">{action}</div>}
                    </div>
                )}
            </div>

            {/* Form/Content Area */}
            {props.children && (
                <div className="relative z-10 border-t border-border/50 bg-card/40 p-5">
                    {props.children}
                </div>
            )}
        </Card>
    )
}
