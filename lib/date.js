export function htmlDate(dateString) {
  if (!dateString) {
    return "Not yet";
  }
  const date = new Date(dateString);
  return `${date.getFullYear().toString().padStart(4, "0")}-${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

export function timestampFromDate(date) {
  if (!isValidDate(date)) {
    return 0;
  }

  return new Date(date).toISOString().slice(0, 19).replace("T", " ");
}

export function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

export function toUTCdatestring(dbDateString) {
  // dbDateString is in yyyy-mm-dd hh:mm:ss format in UTC
  // JS needs it as yyyy-mm-ddThh:mm:ssZ to indicate it is UTC
  if(dbDateString == undefined) return 0;
  const split = dbDateString.split(" ");
  return split[0] + "T" + split[1] + "Z";
}
