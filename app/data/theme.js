// Colors order:

// 0. background-primary
// 1. background-secondary
// 2. background-tertiary

// 3. foreground-primary
// 4. foreground-secondary
// 5. foreground-tertiary

// 6. accent-primary-1
// 7. accent-primary-2
// 8. accent-primary-3
// 9. accent-primary-light

// 10. accent-secondary-1
// 11. accent-secondary-2
// 12. accent-secondary-3
// 13. accent-secondary-light

// 14. accent-tertiary-1
// 15. accent-tertiary-2
// 16. accent-tertiary-3
// 17. accent-tertiary-light

const defautlLightColors = [
    'hsl(0, 0%, 98%)',
    'hsl(0, 0%, 72%)',
    'hsl(0, 1%, 60%)',
];

const defaultDarkColors = [
    'hsl(240, 10%, 4%)',
    'hsl(240, 6%, 10%)',
    'hsl(240, 4%, 16%)',
];

const defaultAccentColors = [
    'hsl(224, 76%, 48%)',
    'hsl(226, 71%, 40%)',
    'hsl(224, 64%, 33%)',
    'hsl(217, 91%, 60%)',

    'hsl(0, 74%, 42%)',
    'hsl(0, 70%, 35%)',
    'hsl(0, 63%, 31%)',
    'hsl(0, 84%, 60%)',

    'hsl(163, 94%, 24%)',
    'hsl(163, 88%, 20%)',
    'hsl(164, 86%, 16%)',
    'hsl(160, 84%, 39%)',
];

export const themes = [
    {
        name: 'Default Light',
        colors: [
            ...defautlLightColors,
            ...defaultDarkColors,
            ...defaultAccentColors
        ]
    },
    {
        name: 'Default Dark',
        colors: [
            ...defaultDarkColors,
            ...defautlLightColors,
            ...defaultAccentColors
        ]
    },
];
