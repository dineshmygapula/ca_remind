'use client';

import { useEffect, useState } from 'react';

/**
 * Reads dark mode directly off the `.dark` class on <html>, the same class
 * your global.css theme tokens key off of. No context/provider needed —
 * whatever toggles `.dark` on the root element (theme switcher, system
 * preference, etc.) is automatically picked up here via MutationObserver.
 */
export function useIsDarkMode(): boolean {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const root = document.documentElement;

        const update = () => setIsDark(root.classList.contains('dark'));
        update();

        const observer = new MutationObserver(update);
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isDark;
}