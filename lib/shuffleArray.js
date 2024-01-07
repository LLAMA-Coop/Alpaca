export default function shuffleArray(array) {
    // use spread operator to copy parameter array
    let rtnArray = [...array];
    // loop through each item in array starting from last
    for (let i = array.length - 1; i > 0; i--) {
        // Pick random index less than current index
        const j = Math.floor(Math.random() * (i + 1));
        // Swap items at current index with item at random index
        // This syntax uses deconstructing of arrays to assign both indexes simultaneously
        [rtnArray[i], rtnArray[j]] = [rtnArray[j], rtnArray[i]];
    }
    return rtnArray;
}