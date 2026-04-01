import { Moon, Sun, Monitor } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle theme"
                >
                    {appearance === 'dark' ? (
                        <Moon className="h-4 w-4" />
                    ) : appearance === 'light' ? (
                        <Sun className="h-4 w-4" />
                    ) : (
                        <Monitor className="h-4 w-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                    onClick={() => updateAppearance('light')}
                    className="gap-2 cursor-pointer"
                >
                    <Sun className="h-3.5 w-3.5" />
                    <span className="text-sm">Light</span>
                    {appearance === 'light' && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => updateAppearance('dark')}
                    className="gap-2 cursor-pointer"
                >
                    <Moon className="h-3.5 w-3.5" />
                    <span className="text-sm">Dark</span>
                    {appearance === 'dark' && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => updateAppearance('system')}
                    className="gap-2 cursor-pointer"
                >
                    <Monitor className="h-3.5 w-3.5" />
                    <span className="text-sm">Sistem</span>
                    {appearance === 'system' && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
