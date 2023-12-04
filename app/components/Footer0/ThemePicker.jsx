"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef } from "react";
import { palettes } from "@/app/data/palettes";
import styles from "./ThemePicker.module.css";

const paletteAttributes = [
    "--accent-primary-1",
    "--accent-primary-2",
    "--accent-primary-3",
    "--accent-primary-light",

    "--accent-secondary-1",
    "--accent-secondary-2",
    "--accent-secondary-3",
    "--accent-secondary-light",

    "--accent-tertiary-1",
    "--accent-tertiary-2",
    "--accent-tertiary-3",
    "--accent-tertiary-light",
];

export function ThemePicker() {
    const [showThemes, setShowThemes] = useState(false);
    const [showPalettes, setShowPalettes] = useState(false);

    const [activeTheme, setActiveTheme] = useState(2);
    const [activePalette, setActivePalette] = useState(0);

    const activeIcon = <FontAwesomeIcon icon={faCheck} />;
    const themeRef = useRef(null);
    const paletteRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (themeRef.current && !themeRef.current.contains(e.target)) {
                setShowThemes(false);
            }
            if (paletteRef.current && !paletteRef.current.contains(e.target)) {
                setShowPalettes(false);
            }
        }

        function handleKeyDown(e) {
            if (e.key === "Escape") {
                setShowThemes(false);
                setShowPalettes(false);
            }
        }

        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showThemes, showPalettes]);

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
            <div ref={themeRef}>
                <button
                    aria-label="Change theme"
                    aria-haspopup="true"
                    aria-expanded={showThemes}
                    aria-controls="theme-popup"
                    onClick={() => {
                        setShowPalettes(false);
                        setShowThemes((prev) => !prev);
                    }}
                    style={{
                        backgroundColor: showThemes
                            ? "var(--background-secondary)"
                            : "",
                    }}
                >
                    <div>
                        <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                fill="currentColor"
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                            />
                        </svg>
                        <span>{lightModes[activeTheme]}</span>
                    </div>
                </button>

                {showThemes && (
                    <div className="menuPopup">
                        <ul>
                            {lightModes.map((mode, index) => (
                                <li
                                    key={index}
                                    tabIndex={0}
                                    role="radio"
                                    aria-label={mode}
                                    aria-selected={activeTheme === index}
                                    aria-current={activeTheme === index}
                                    aria-setsize={lightModes.length}
                                    aria-posinset={index + 1}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") setTheme(index);
                                    }}
                                    onClick={() => setTheme(index)}
                                >
                                    {mode}
                                    {activeTheme === index ? activeIcon : null}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div ref={paletteRef}>
                <button
                    aria-label="Color palette"
                    aria-haspopup="true"
                    aria-expanded={showPalettes}
                    aria-controls="palettes"
                    onClick={() => {
                        setShowThemes(false);
                        setShowPalettes((prev) => !prev);
                    }}
                    style={{
                        backgroundColor: showPalettes
                            ? "var(--background-secondary)"
                            : "",
                    }}
                >
                    <div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="var(--foreground-primary)"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25" />
                            <path d="M8.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                            <path d="M12.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                            <path d="M16.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        </svg>
                        <span>{palettes[activePalette].name}</span>
                    </div>
                </button>

                {showPalettes && (
                    <div className="menuPopup">
                        <ul>
                            {palettes.map((palette, index) => (
                                <li
                                    key={index}
                                    tabIndex={0}
                                    role="radio"
                                    aria-label={palette.name}
                                    aria-selected={activePalette === index}
                                    aria-current={activePalette === index}
                                    aria-setsize={palettes.length}
                                    aria-posinset={index + 1}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setPalette(index);
                                        }
                                    }}
                                    onClick={() => setPalette(index)}
                                >
                                    {palette.name}
                                    {activePalette === index
                                        ? activeIcon
                                        : null}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
