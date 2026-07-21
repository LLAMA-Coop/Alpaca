"use client";

import { getAccentVariables, getThemeVariables, themes } from "@/lib/themes";
import { useEffect } from "react";

export function ThemeSetter({ settings }) {
    useEffect(() => {
        handleTheme(settings);
    }, [settings]);

    function handleTheme(settings) {
        const savedThemeName = settings?.theme || localStorage.getItem("theme") || "Default Dark";
        const accentName = settings?.accent || localStorage.getItem("accent");
        const defaultDark = themes.find((t) => t.name === "Default Dark");
        const requestedTheme = themes.find((t) => t.name === savedThemeName);
        const theme = requestedTheme?.isDark ? requestedTheme : defaultDark;

        if (!theme) return;

        const variables = getThemeVariables(theme);
        if (!variables?.length) return;

        variables.forEach((variable) => {
            document.documentElement.style.setProperty(variable.key, variable.value);
        });

        document.documentElement.setAttribute("color-scheme", "dark");
        document.documentElement.dataset.theme = "dark";

        if (accentName) {
            const accent = theme.palette.accents.find((a) => a[0] === accentName);
            if (!accent || accent.length !== 2) return;

            getAccentVariables(accent).forEach((variable) => {
                document.documentElement.style.setProperty(variable.key, variable.value);
            });
        }
    }

    return null;
}
