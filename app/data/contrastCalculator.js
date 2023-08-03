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

function rgbToLuminanceValue({ r, g, b }) {
  const gammaThreshhold = 0.03928;
  const denom = 12.92;
  function calc(color) {
    return ((color + 0.055) / 1.055) ** GAMMA;
  }

  return {
    red: r <= gammaThreshhold ? r / denom : calc(r),
    green: g < gammaThreshhold ? g / denom : calc(g),
    blue: b < gammaThreshhold ? b / denom : calc(b),
  };
}

export default function getContrastRatio(hexColor1, hexColor2) {
  const rgbColor1 = hexToRgb(hexColor1);
  const rgbColor2 = hexToRgb(hexColor2);
  const relativeLum1 = rgbToLuminanceValue(rgbColor1);
  const relativeLum2 = rgbToLuminanceValue(rgbColor2);
  console.log(relativeLum1, relativeLum2);

  // Convert RGB values to relative luminance (as per WCAG 2.0 specifications)
  const luminance1 =
    (relativeLum1.r * offset.RED +
      relativeLum1.g * offset.GREEN +
      relativeLum1.b * offset.BLUE) /
    255;
  const luminance2 =
    (relativeLum2.r * offset.RED +
      relativeLum2.g * offset.GREEN +
      relativeLum2.b * offset.BLUE) /
    255;

  // Calculate the contrast ratio
  const contrastRatio =
    luminance1 >= luminance2
      ? (luminance1 + 0.05) / (luminance2 + 0.05)
      : (luminance2 + 0.05) / (luminance1 + 0.05);

  // Return the contrast ratio rounded to two decimal places
  return Math.round(contrastRatio * 100) / 100;
}
