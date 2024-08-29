"use client";

import { useEffect, useState, useRef } from "react";
import { palettes } from "@/app/data/palettes";
import styles from "./ThemePicker.module.css";

const paletteAttributes = [
    "--accent-1",
    "--accent-1-hover",
    "--accent-1-active",
    "--accent-1-light",

    "--accent-2",
    "--accent-2-hover",
    "--accent-2-active",
    "--accent-2-light",

    "--accent-3",
    "--accent-3-hover",
    "--accent-3-active",
    "--accent-3-light",
];

export function ThemePicker() {
    const [activeTheme, setActiveTheme] = useState(2);
    const [activePalette, setActivePalette] = useState(0);

    const activeIcon = <path d="M5 12l5 5l10 -10" />;
    const paletteButton = useRef(null);
    const themeButton = useRef(null);

    useEffect(() => {
        const setTheme = () => {
            const theme = parseInt(localStorage.getItem("theme") ?? 2);

            setActiveTheme(theme);
            changeCssProperties(theme);
        };

        const changeSystemTheme = (e) => {
            if (!activeTheme === 2) return;
            if (e.matches) {
                document.documentElement.setAttribute("data-theme", "dark");
                document.documentElement.style.colorScheme = "dark";
            } else {
                document.documentElement.setAttribute("data-theme", "light");
                document.documentElement.style.colorScheme = "light";
            }
        };

        const system = window.matchMedia("(prefers-color-scheme: dark)");
        if (system.addEventListener) {
            system.addEventListener("change", changeSystemTheme);
        } else {
            system.addListener(changeSystemTheme);
        }

        setTheme();
        return () => {
            if (system.removeEventListener) {
                system.removeEventListener("change", changeSystemTheme);
            } else {
                system.removeListener(changeSystemTheme);
            }
        };
    }, [activeTheme]);

    useEffect(() => {
        const setPalette = () => {
            const palette = localStorage.getItem("palette");

            setActivePalette(isNaN(parseInt(palette)) ? 0 : parseInt(palette));
            setCssVariables(palettes[parseInt(palette) ?? 0]);
        };

        setPalette();
    }, []);

    const changeCssProperties = (theme) => {
        const darkTheme = window.matchMedia("(prefers-color-scheme: dark)");

        if (theme === 0 || (theme === 2 && !darkTheme.matches)) {
            document.documentElement.setAttribute("data-theme", "light");
            document.documentElement.style.colorScheme = "light";
        } else if (theme === 1 || (theme === 2 && darkTheme.matches)) {
            document.documentElement.setAttribute("data-theme", "dark");
            document.documentElement.style.colorScheme = "dark";
        }
    };

    const setTheme = (theme) => {
        if (![0, 1, 2].includes(theme)) {
            theme = 2;
        }

        localStorage.setItem("theme", theme);
        setActiveTheme(theme);
        changeCssProperties(theme);
    };

    const setCssVariables = (palette) => {
        if (!palette) return;
        paletteAttributes.forEach((attr, index) => {
            document.documentElement.style.setProperty(
                attr,
                palette.colors[index],
            );
        });
    };

    const setPalette = (index) => {
        setActivePalette(index);
        localStorage.setItem("palette", index);
        setCssVariables(palettes[index]);
    };

    const lightModes = ["Light", "Dark", "System"];

    return (
        <div className={styles.themeContainer}>
            <div>
                <button
                    ref={themeButton}
                    aria-haspopup="true"
                    aria-label="Change theme"
                    aria-controls="theme-popup"
                    aria-expanded={false}
                    className={false ? styles.active : ""}
                    onClick={(e) => {
                        if (false) {
                            // setMenu({
                            //     element: e.currentTarget,
                            //     items: lightModes.map((mode) => ({
                            //         name: mode,
                            //         onClick: () => {
                            //             setTheme(lightModes.indexOf(mode));
                            //         },
                            //     })),
                            //     active: activePalette,
                            //     activeIcon: activeIcon,
                            //     keepOpen: true,
                            //     top: true,
                            //     right: true,
                            // });
                        } else {
                        }
                    }}
                >
                    <div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                        >
                            <path
                                className="fill"
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                            />
                        </svg>

                        <span>{lightModes[activeTheme]}</span>
                    </div>
                </button>
            </div>

            <div>
                <button
                    ref={paletteButton}
                    aria-haspopup="true"
                    aria-controls="palettes"
                    aria-label="Color palette"
                    aria-expanded={false}
                    className={false ? styles.active : ""}
                    onClick={(e) => {
                        if (false) {
                            // setMenu({
                            //     element: e.currentTarget,
                            //     items: palettes.map((palette) => ({
                            //         name: palette.name,
                            //         onClick: () => {
                            //             setPalette(palettes.indexOf(palette));
                            //         },
                            //     })),
                            //     active: activePalette,
                            //     activeIcon: activeIcon,
                            //     keepOpen: true,
                            //     top: true,
                            //     right: true,
                            // });
                        } else {
                        }
                    }}
                >
                    <div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                        >
                            <path d="M3 21v-4a4 4 0 1 1 4 4h-4" />
                            <path d="M21 3a16 16 0 0 0 -12.8 10.2" />
                            <path d="M21 3a16 16 0 0 1 -10.2 12.8" />
                            <path d="M10.6 9a9 9 0 0 1 4.4 4.4" />
                        </svg>

                        <span>{palettes[activePalette].name}</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
