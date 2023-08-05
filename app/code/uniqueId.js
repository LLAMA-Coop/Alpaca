export default function makeUniqueId() {
    return (new Date().getTime() * Math.random() * 2 ** 20).toString(36);
}
