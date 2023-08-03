// Credit: kirilloid
// https://stackoverflow.com/questions/9733288/how-to-programmatically-calculate-the-contrast-ratio-between-two-colors

const offset = {
  RED: 0.2126,
  GREEN: 0.7152,
  BLUE: 0.0722,
};

const GAMMA = 2.4;

function hexToRgb(hex) {
  if (hex[0] === "#") {
    hex = hex.slice(1);
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function luminance({ r, g, b }) {
  function calc(num) {
    num /= 255;
    return num <= 0.03928 ? num / 12.92 : ((num + 0.055) / 1.055) ** GAMMA;
  }

  return calc(r) * offset.RED + calc(g) * offset.GREEN + calc(b) * offset.BLUE;
}

export default function contrast(hexColor1, hexColor2) {
  const rgb1 = hexToRgb(hexColor1);
  const rgb2 = hexToRgb(hexColor2);
  const lum1 = luminance(rgb1);
  const lum2 = luminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const contrast = (brightest + 0.05) / (darkest + 0.05);
  return Math.floor(contrast * 100) / 100;
}