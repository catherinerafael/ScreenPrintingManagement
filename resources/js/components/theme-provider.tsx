import { createContext, useContext } from 'react';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';

type ThemeContextType = {
    theme: Appearance;
    setTheme: (theme: Appearance) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <ThemeContext.Provider value={{ theme: appearance, setTheme: updateAppearance }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
