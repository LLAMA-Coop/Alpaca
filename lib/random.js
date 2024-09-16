import { nanoid } from "nanoid";

export function getNanoId() {
    return nanoid();
}

export function isValidId(id) {
    return Number.isInteger(id) && id > 0;
}
