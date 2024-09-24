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
            const theme = themes.find((theme) => theme.name === themeName);
            const variables = getThemeVariables(theme);

            // Apply theme variables to the document
            variables.forEach((variable) => {
                document.documentElement.style.setProperty(
                    variable.key,
                    variable.value,
                );
            });

            if (theme.isDark) {
                document.documentElement.setAttribute("color-scheme", "dark");
            } else {
                document.documentElement.setAttribute("color-scheme", "light");
            }

            if (accentName) {
                const accent = theme.palette.accents.find(
                    (accent) => accent.name === accentName,
                );
                const variables = getAccentVariables(accent);

                // Apply accent variables to the document
                variables.forEach((variable) => {
                    document.documentElement.style.setProperty(
                        variable.key,
                        variable.value,
                    );
                });
            }
        }
    }

    return null;
}
