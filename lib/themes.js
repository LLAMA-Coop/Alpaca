const defaultAccents = [
    {
        name: "Green",
        colors: {
            "--accent": "#10b981",
        },
    },
    {
        name: "Blue",
        colors: {
            "--accent": "#38bdf8",
        },
    },
    {
        name: "Purple",
        colors: {
            "--accent": "#8b5cf6",
        },
    },
];

const catppuccinAccents = [
    {
        name: "Rosewater",
        colors: {
            "--accent": "#dc8a78",
        },
    },
    {
        name: "Flamingo",
        colors: {
            "--accent": "#dd7878",
        },
    },
    {
        name: "Pink",
        colors: {
            "--accent": "#ea76cb",
        },
    },
    {
        name: "Mauve",
        colors: {
            "--accent": "#8839ef",
        },
    },
    {
        name: "Maroon",
        colors: {
            "--accent": "#e64553",
        },
    },
    {
        name: "Peach",
        colors: {
            "--accent": "#fe640b",
        },
    },
    {
        name: "Teal",
        colors: {
            "--accent": "#179299",
        },
    },
    {
        name: "Sky",
        colors: {
            "--accent": "#04a5e5",
        },
    },
    {
        name: "Sapphire",
        colors: {
            "--accent": "#209fb5",
        },
    },
    {
        name: "Blue",
        colors: {
            "--accent": "#1e66f5",
        },
    },
    {
        name: "Lavender",
        colors: {
            "--accent": "#7287fd",
        },
    },
];

const nordAccents = [
    {
        name: "Blue 0",
        colors: {
            "--accent": "#8fbcbb",
        },
    },
    {
        name: "Blue 1",
        colors: {
            "--accent": "#88c0d0",
        },
    },
    {
        name: "Blue 2",
        colors: {
            "--accent": "#81a1c1",
        },
    },
    {
        name: "Blue 3",
        colors: {
            "--accent": "#5e81ac",
        },
    },
    {
        name: "Orange",
        colors: {
            "--accent": "#d08770",
        },
    },
    {
        name: "Pink",
        colors: {
            "--accent": "#b48ead",
        },
    },
];

export const themes = [
    {
        name: "Default Light",
        isDark: false,
        palette: {
            colors: {
                "--bg-0": "#ffffff",
                "--bg-1": "#eff1f5",
                "--bg-2": "#e6e9ef",
                "--bg-3": "#dce0e8",
                "--bg-4": "#ccd0da",

                "--fg-1": "#020617",
                "--fg-2": "#0f172a",
                "--fg-3": "#1e293b",
                "--fg-4": "#334155",

                "--danger": "#e11d48",
                "--warning": "#df8e1d",
                "--success": "#4ade80",
            },

            accents: defaultAccents,
        },
    },
    {
        name: "Default Dark",
        isDark: true,
        palette: {
            colors: {
                "--bg-0": "#000511",
                "--bg-1": "#020617",
                "--bg-2": "#0f172a",
                "--bg-3": "#1e293b",
                "--bg-4": "#334155",

                "--fg-1": "#f8fafc",
                "--fg-2": "#e2e8f0",
                "--fg-3": "#cbd5e1",
                "--fg-4": "#989fa8",

                "--danger": "#e11d48",
                "--warning": "#df8e1d",
                "--success": "#4ade80",
            },

            accents: defaultAccents,
        },
    },
    {
        name: "Catppuccin Latte",
        isDark: false,
        palette: {
            colors: {
                "--bg-0": "#eff1f5",
                "--bg-1": "#e6e9ef",
                "--bg-2": "#dce0e8",
                "--bg-3": "#ccd0da",
                "--bg-4": "#bcc0cc",

                "--fg-1": "#4c4f69",
                "--fg-2": "#5c5f77",
                "--fg-3": "#6c6f85",
                "--fg-4": "#7c7f93",

                "--danger": "#d20f39",
                "--warning": "#df8e1d",
                "--success": "#40a02b",
            },

            accents: catppuccinAccents,
        },
    },
    {
        name: "Catppuccin Frappé",
        isDark: true,
        palette: {
            colors: {
                "--bg-0": "#303446",
                "--bg-1": "#292c3c",
                "--bg-2": "#232634",
                "--bg-3": "#414559",
                "--bg-4": "#51576d",

                "--fg-1": "#c6d0f5",
                "--fg-2": "#b5bfe2",
                "--fg-3": "#a5adce",
                "--fg-4": "#949cbb",

                "--danger": "#e78284",
                "--warning": "#e5c890",
                "--success": "#a6d189",
            },

            accents: catppuccinAccents,
        },
    },
    {
        name: "Catppuccin Macchiato",
        isDark: true,
        palette: {
            colors: {
                "--bg-0": "#24273a",
                "--bg-1": "#1e2030",
                "--bg-2": "#181926",
                "--bg-3": "#363a4f",
                "--bg-4": "#494d64",

                "--fg-1": "#cad3f5",
                "--fg-2": "#b8c0e0",
                "--fg-3": "#a5adcb",
                "--fg-4": "#939ab7",

                "--danger": "#ed8796",
                "--warning": "#eed49f",
                "--success": "#a6da95",
            },

            accents: catppuccinAccents,
        },
    },
    {
        name: "Catppuccin Mocha",
        isDark: true,
        palette: {
            colors: {
                "--bg-0": "#1e1e2e",
                "--bg-1": "#181825",
                "--bg-2": "#11111b",
                "--bg-3": "#313244",
                "--bg-4": "#45475a",

                "--fg-1": "#cdd6f4",
                "--fg-2": "#bac2de",
                "--fg-3": "#a6adc8",
                "--fg-4": "#9399b2",

                "--danger": "#f38ba8",
                "--warning": "#f9e2af",
                "--success": "#a6e3a1",
            },

            accents: catppuccinAccents,
        },
    },
    {
        name: "Nord Polar Night",
        isDark: true,
        palette: {
            colors: {
                "--bg-0": "#2e3440",
                "--bg-1": "#3b4252",
                "--bg-2": "#434c5e",
                "--bg-3": "#4c566a",
                "--bg-4": "#5b677e",

                "--fg-1": "#eceff4",
                "--fg-2": "#e5e9f0",
                "--fg-3": "#d8dee9",
                "--fg-4": "#e5e9f0",

                "--danger": "#bf616a",
                "--warning": "#ebcb8b",
                "--success": "#a3be8c",
            },

            accents: nordAccents,
        },
    },
    {
        name: "Nord Snow Storm",
        isDark: false,
        palette: {
            colors: {
                "--bg-0": "#eceff4",
                "--bg-1": "#e5e9f0",
                "--bg-2": "#d8dee9",
                "--bg-3": "#d6dbe4",
                "--bg-4": "#c2c8d1",

                "--fg-1": "#2e3440",
                "--fg-2": "#3b4252",
                "--fg-3": "#434c5e",
                "--fg-4": "#4c566a",

                "--danger": "#bf616a",
                "--warning": "#ebcb8b",
                "--success": "#a3be8c",
            },

            accents: nordAccents,
        },
    },
];

export function getThemeVariables(theme) {
    const variables = [];

    for (const [key, value] of Object.entries(theme.palette.colors)) {
        variables.push({ key, value });

        if (key === "--bg-4") {
            variables.push({
                key: "--border-color",
                value: `${value}80`,
            });
        }

        if (key === "--danger") {
            variables.push({
                key: "--danger-fg",
                value: getContrastColor(value),
            });
        } else if (key === "--warning") {
            variables.push({
                key: "--warning-fg",
                value: getContrastColor(value),
            });
        } else if (key === "--success") {
            variables.push({
                key: "--success-fg",
                value: getContrastColor(value),
            });
        }
    }

    return variables;
}

export function getAccentVariables(accent) {
    const variables = [];

    variables.push({
        key: "--accent",
        value: accent.colors["--accent"],
    });

    variables.push({
        key: "--accent-fg",
        value: getContrastColor(accent.colors["--accent"]),
    });

    variables.push({
        key: "--accent-50",
        value: `${accent.colors["--accent"]}80`,
    });

    variables.push({
        key: "--accent-20",
        value: `${accent.colors["--accent"]}33`,
    });

    variables.push({
        key: "--accent-08",
        value: `${accent.colors["--accent"]}14`,
    });

    return variables;
}

function hexToRgb(hex) {
    // Should return an object with the following structure:
    // {
    //     r: number,
    //     g: number,
    //     b: number,
    // }

    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
}

export function getContrastColor(color) {
    // Should return a color that's easy to read on top of the given color
    // The color can be in any format that CSS supports

    const rgb = hexToRgb(color);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

    return brightness >= 128 ? "#000000" : "#ffffff";
}
