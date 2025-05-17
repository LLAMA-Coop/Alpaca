export default function listPrint(array, conjunction) {
  if (array.length === 0) return "";
  if (array.length === 1) return array[0];
  if (array.length === 2)
    return `${array[0]}${conjunction ? " " + conjunction + " " : " "}${array[1]}`;
  return `${array.slice(0, -1).join(", ")}${conjunction ? ", " + conjunction + " " : ", "}${array[array.length - 1]}`;
}
