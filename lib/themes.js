const defaultAccents = [
    ["Green", "#10b981"],
    ["Blue", "#38bdf8"],
    ["Purple", "#8b5cf6"],
];

const catppuccinAccents = [
    ["Rosewater", "#dc8a78"],
    ["Flamingo", "#dd7878"],
    ["Pink", "#ea76cb"],
    ["Mauve", "#8839ef"],
    ["Maroon", "#e64553"],
    ["Peach", "#fe640b"],
    ["Teal", "#179299"],
    ["Sky", "#04a5e5"],
    ["Sapphire", "#209fb5"],
    ["Blue", "#1e66f5"],
    ["Lavender", "#7287fd"],
];

const nordAccents = [
    ["Blue 0", "#8fbcbb"],
    ["Blue 1", "#88c0d0"],
    ["Blue 2", "#81a1c1"],
    ["Blue 3", "#5e81ac"],
    ["Orange", "#d08770"],
    ["Pink", "#b48ead"],
];

const rosePineAccents = [
    ["Rose", "#ebbcba"],
    ["Pine", "#31748f"],
    ["Iris", "#c4a7e7"],
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
                "--fg-4": "#ccd0d6",

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
    {
        name: "Rosé Pine",
        isDark: true,
        palette: {
            colors: {
                "--bg-0": "#191724",
                "--bg-1": "#1f1d2e",
                "--bg-2": "#21202e",
                "--bg-3": "#26233a",
                "--bg-4": "#403d52",

                "--fg-1": "#e0def4",
                "--fg-2": "#908caa",
                "--fg-3": "#6e6a86",
                "--fg-4": "#524f67",

                "--danger": "#eb6f92",
                "--warning": "#f6c177",
                "--success": "#9ccfd8",
            },

            accents: rosePineAccents,
        },
    },
];

export function getThemeVariables(theme) {
    const variables = [];
    if (!theme?.palette?.colors) return variables;

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
    if (!accent || accent.length !== 2) return variables;

    variables.push(
        {
            key: "--accent",
            value: accent[1],
        },
        {
            key: "--accent-fg",
            value: getContrastColor(accent[1]),
        },
        {
            key: "--accent-50",
            value: `${accent[1]}80`,
        },
        {
            key: "--accent-20",
            value: `${accent[1]}33`,
        },
        {
            key: "--accent-08",
            value: `${accent[1]}14`,
        }
    );

    return variables;
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
}

export function getContrastColor(color) {
    // Should return a color that's easy to read on top of the given color
    // The color can be in any format that CSS supports

    if (!color || !/^#[0-9A-F]{6}$/i.test(color)) {
        return "#000000";
    }

    const rgb = hexToRgb(color);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

    return brightness >= 128 ? "#000000" : "#ffffff";
}
