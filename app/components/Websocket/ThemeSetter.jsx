"use client";

import { getAccentVariables, getThemeVariables, themes } from "@/lib/themes";
import { useEffect } from "react";

export function ThemeSetter({ settings }) {
    useEffect(() => {
        handleTheme(settings);
    }, []);

    function handleTheme(settings) {
        const themeName = settings?.theme || localStorage.getItem("theme");
        const accentName = settings?.accent || localStorage.getItem("accent");

        if (themeName) {
            const theme = themes.find((t) => t.name === themeName);
            if (!theme) return;

            const variables = getThemeVariables(theme);
            if (!variables?.length) return;

            // Apply theme variables to the document
            variables.forEach((variable) => {
                document.documentElement.style.setProperty(variable.key, variable.value);
            });

            if (theme.isDark) {
                document.documentElement.setAttribute("color-scheme", "dark");
            } else {
                document.documentElement.setAttribute("color-scheme", "light");
            }

            if (accentName) {
                const accent = theme.palette.accents.find((a) => a[0] === accentName);
                if (!accent || accent.length !== 2) return;

                const variables = getAccentVariables(accent);

                // Apply accent variables to the document
                variables.forEach((variable) => {
                    document.documentElement.style.setProperty(variable.key, variable.value);
                });
            }
        }
    }

    return null;
}
