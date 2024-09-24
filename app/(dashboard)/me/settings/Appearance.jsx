"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/app/components/client";
import styles from "./Appearance.module.css";
import { getAccentVariables, getThemeVariables, themes } from "@/lib/themes";
import { useState } from "react";

export function Appearance({ user }) {
    const [current, setCurrent] = useState(
        themes.find((theme) => theme.name === user?.settings?.theme) ||
            themes[0],
    );
    const [accent, setAccent] = useState(
        current.palette.accents.find(
            (accent) => accent.name === user?.settings?.accent,
        ) || current.palette.accents[0],
    );

    const hasChanged =
        current.name !== user?.settings?.theme ||
        accent.name !== user?.settings?.accent;

    function handleThemeChange(theme) {
        if (current.name === theme.name) {
            return;
        }

        setCurrent(theme);
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

        const newAccent = theme.palette.accents[0];

        if (newAccent === accent) {
            return handleSave(theme.name, newAccent.name);
        }

        handleAccentChange(newAccent, theme);
    }

    function handleAccentChange(a, theme = current) {
        if (a.name === accent.name) {
            return;
        }

        setAccent(a);
        const variables = getAccentVariables(a);

        // Apply accent variables to the document
        variables.forEach((variable) => {
            document.documentElement.style.setProperty(
                variable.key,
                variable.value,
            );
        });

        // Save the accent to the user
        handleSave(theme.name, a.name);
    }

    async function handleSave(themeName, accentName) {
        // Save to local storage just in case
        localStorage.setItem("theme", themeName);
        localStorage.setItem("accent", accentName);

        if (!user?.settings) {
            return;
        }

        if (
            user.settings.theme === themeName &&
            user.settings.accent === accentName
        ) {
            return;
        }

        // Save the user's settings to the database
        fetch("/api/me", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                settings: {
                    ...user.settings,
                    theme: themeName,
                    accent: accentName,
                },
            }),
        });
    }

    return (
        <div className={styles.container}>
            <section>
                <h2>Themes</h2>

                <ol className={styles.list}>
                    {themes.map((theme) => (
                        <Tooltip key={theme.name} gap={10}>
                            <TooltipTrigger>
                                <button
                                    className={styles.theme}
                                    onClick={() => handleThemeChange(theme)}
                                    style={{
                                        backgroundColor:
                                            theme.palette.colors["--bg-1"],
                                        transform:
                                            current.name === theme.name
                                                ? "scale(1.2)"
                                                : "",
                                    }}
                                />
                            </TooltipTrigger>

                            <TooltipContent>{theme.name}</TooltipContent>
                        </Tooltip>
                    ))}
                </ol>
            </section>

            <section>
                <h2>Accent Colors</h2>

                <ol className={styles.list}>
                    {current.palette.accents.map((a) => (
                        <Tooltip key={a.name} gap={10}>
                            <TooltipTrigger>
                                <button
                                    className={styles.theme}
                                    onClick={() => handleAccentChange(a)}
                                    style={{
                                        backgroundColor: a.colors["--accent"],
                                        transform:
                                            a.name === accent.name
                                                ? "scale(1.2)"
                                                : "",
                                    }}
                                />
                            </TooltipTrigger>

                            <TooltipContent>{a.name}</TooltipContent>
                        </Tooltip>
                    ))}
                </ol>
            </section>
        </div>
    );
}
