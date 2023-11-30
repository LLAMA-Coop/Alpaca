export default function inputSize(string) {
    const init = 3;
    let padding = 1;
    if (string.length < init) return init;
    if (string.length > 22) padding = 2;
    return string.length + padding;
}
