"use client";

import {
    Checkbox,
    InfoBox,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/app/components/client";
import { getAccentVariables, getThemeVariables, themes } from "@/lib/themes";
import styles from "./Settings.module.css";
import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { getApiUrl } from "@/lib/api";

export function Appearance({ user }) {
    const [current, setCurrent] = useState(
        themes.find((t) => t.name === user?.settings?.theme) || themes[0]
    );
    const [accent, setAccent] = useState(
        current.palette.accents.find((a) => a[0] === user?.settings?.accent) ||
            current.palette.accents[0]
    );

    const [showConfetti, setShowConfetti] = useState(user?.settings?.showConfetti ?? true);
    const [confettiLoading, setConfettiLoading] = useState(false);

    const [showTools, setShowTools] = useState(user?.settings?.showTools ?? true);
    const [toolsLoading, setToolsLoading] = useState(false);

    const setSettings = useStore((state) => state.setSettings);

    useEffect(() => {
        setSettings({ showConfetti });
    }, [showConfetti]);

    function handleThemeChange(theme) {
        if (current.name === theme.name) {
            return;
        }

        setCurrent(theme);
        const variables = getThemeVariables(theme);

        // Apply theme variables to the document
        variables.forEach((variable) => {
            document.documentElement.style.setProperty(variable.key, variable.value);
        });

        if (theme.isDark) {
            document.documentElement.setAttribute("color-scheme", "dark");
        } else {
            document.documentElement.setAttribute("color-scheme", "light");
        }

        const newAccent = theme.palette.accents[0];

        if (newAccent === accent) {
            return handleSave(theme.name, newAccent[0]);
        }

        handleAccentChange(newAccent, theme);
    }

    function handleAccentChange(a, theme = current) {
        if (a[0] === accent[0]) return;

        setAccent(a);
        const variables = getAccentVariables(a);

        // Apply accent variables to the document
        variables.forEach((variable) => {
            document.documentElement.style.setProperty(variable.key, variable.value);
        });

        // Save the accent to the user
        handleSave(theme.name, a[0]);
    }

    async function handleSave(themeName, accentName) {
        // Save to local storage just in case
        localStorage.setItem("theme", themeName);
        localStorage.setItem("accent", accentName);

        if (!user?.settings) {
            return;
        }

        if (
            user.settings &&
            user.settings.theme === themeName &&
            user.settings.accent === accentName
        ) {
            return;
        }

        // Save the user's settings to the database
        fetch(`${getApiUrl()}/me`, {
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
        <section className={styles.content}>
            <h2>Themes</h2>

            <div>
                <ol className={styles.list}>
                    {themes.map((theme) => (
                        <Tooltip
                            key={theme.name}
                            gap={10}
                        >
                            <TooltipTrigger>
                                <button
                                    className={styles.theme}
                                    onClick={() => handleThemeChange(theme)}
                                    style={{
                                        backgroundColor: theme.palette.colors["--bg-1"],
                                        transform: current.name === theme.name ? "scale(1.2)" : "",
                                    }}
                                />
                            </TooltipTrigger>

                            <TooltipContent>{theme.name}</TooltipContent>
                        </Tooltip>
                    ))}
                </ol>
            </div>

            <h2>Accent Colors</h2>

            <div>
                <ol className={styles.list}>
                    {current.palette.accents.map((a) => (
                        <Tooltip
                            gap={10}
                            key={a[0]}
                        >
                            <TooltipTrigger>
                                <button
                                    className={styles.theme}
                                    onClick={() => handleAccentChange(a)}
                                    style={{
                                        backgroundColor: a[1],
                                        transform: a[0] === accent[0] ? "scale(1.2)" : "",
                                    }}
                                />
                            </TooltipTrigger>

                            <TooltipContent>{a[0]}</TooltipContent>
                        </Tooltip>
                    ))}
                </ol>
            </div>

            <h2>Quizzes</h2>

            <div>
                <InfoBox>
                    When you complete a quiz, you can choose to have confetti appear on the screen,
                    as well as a clapping sound. This can be disabled if you prefer a more subtle
                    experience.
                </InfoBox>

                <Checkbox
                    close
                    value={showConfetti}
                    loading={confettiLoading}
                    label="Show confetti when a quiz is completed"
                    onChange={async () => {
                        if (confettiLoading) {
                            return;
                        }

                        setConfettiLoading(true);

                        await fetch(`${getApiUrl()}/me`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                settings: {
                                    ...user.settings,
                                    showConfetti: !showConfetti,
                                },
                            }),
                        });

                        setConfettiLoading(false);
                        setShowConfetti((prev) => !prev);
                    }}
                />
            </div>

            <h2>Resources</h2>

            <div>
                <InfoBox>
                    When viewing resources, buttons to edit or delete those resources are available
                    to you if you have the permissions to do so. You can hide these buttons if you
                    only want to view the content. This can be re-enabled at any time. Hiding them
                    will still allow you to edit or delete the resources in their respective pages.
                </InfoBox>

                <Checkbox
                    close
                    value={showTools}
                    loading={toolsLoading}
                    label="Show edit and delete options on resources"
                    onChange={() => {
                        alert("Not implemented yet, we're working on it!");
                    }}
                />
            </div>
        </section>
    );
}
