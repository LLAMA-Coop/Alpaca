export default function shuffleArray(array) {
    let rtnArray = [...array];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rtnArray[i], rtnArray[j]] = [rtnArray[j], rtnArray[i]];
    }
    return rtnArray;
}
