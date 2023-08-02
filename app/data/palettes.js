// Colors order:

// 1. accent-primary-1
// 2. accent-primary-2
// 3. accent-primary-3
// 4. accent-primary-light

// 5. accent-secondary-1
// 6. accent-secondary-2
// 7. accent-secondary-3
// 8. accent-secondary-light

// 9. accent-tertiary-1
// 10. accent-tertiary-2
// 11. accent-tertiary-3
// 12. accent-tertiary-light

const defaultAccentColors = [
  "hsl(224, 76%, 48%)",
  "hsl(226, 71%, 40%)",
  "hsl(224, 64%, 33%)",
  "hsl(217, 91%, 60%)",

  "hsl(0, 74%, 42%)",
  "hsl(0, 70%, 35%)",
  "hsl(0, 63%, 31%)",
  "hsl(0, 84%, 60%)",

  "hsl(163, 94%, 24%)",
  "hsl(163, 88%, 20%)",
  "hsl(164, 86%, 16%)",
  "hsl(160, 84%, 39%)",
];

export const palettes = [
  {
    name: "Default",
    colors: defaultAccentColors,
  },
  {
    name: "Nord",
    colors: [
      "#5E81AC",
      "#81A1C1",
      "#88C0D0",
      "#8FBCBB",

      "#BF616A",
      "#D08770",
      "#EBCB8B",
      "#f7daa2",

      "#778b65",
      "#A3BE8C",
      "#a8c292",
      "#cae7b1",
    ],
  },
  {
    name: "Catppuccin",
    colors: [
      "hsl(220, 91%, 54%)",
      "hsl(189, 70%, 42%)",
      "hsl(197, 97%, 46%)",
      "hsl(231, 97%, 72%)",

      "hsl(347, 87%, 44%)",
      "hsl(355, 76%, 59%)",
      "hsl(22, 99%, 52%)",
      "hsl(35, 77%, 49%)",

      "hsl(266, 85%, 58%)",
      "hsl(316, 73%, 69%)",
      "hsl(0, 60%, 67%)",
      "hsl(11, 59%, 67%)",
    ],
  },
];
