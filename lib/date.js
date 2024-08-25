export function htmlDate(dateString) {
    if(!dateString){
        return "Not yet"
    }
    const date = new Date(dateString);
    return `${date.getFullYear().toString().padStart(4, "0")}-${(
        date.getMonth() + 1
    )
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

export function sqlDate(date) {
    return date.split("T")[0];
}