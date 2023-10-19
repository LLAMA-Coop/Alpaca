export const serialize = (objects) => {
    if(!Array.isArray(objects)){
        return null;
    }
    return objects.map((object) => {
        return JSON.parse(JSON.stringify(object));
    });
};

export const serializeOne = (object) => {
    if(typeof object !== 'object'){
        return null;
    }
    return JSON.parse(JSON.stringify(object));
};
