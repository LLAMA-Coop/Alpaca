export const serialize = (objects) => {
    return objects.map((object) => {
        return JSON.parse(JSON.stringify(object));
    });
};
