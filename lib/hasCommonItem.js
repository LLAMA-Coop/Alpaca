export default function hasCommonItem(array1, array2) {
  if (
    array1 == undefined ||
    array2 == undefined ||
    array1.length === 0 ||
    array2.length === 0
  )
    return false;
  const common = array1.find((x) => array2.includes(x));
  if (common) return true;
  return false;
}
