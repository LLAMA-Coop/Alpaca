export function getChangedFields(original, updated, skipNested = false) {
    // Also take into account nested objects
    const changedFields = {};

    for (const key in updated) {
        // Check for nested objects

        // If item isn't in original object, don't count it as a change
        if (!original.hasOwnProperty(key)) {
            continue;
        }

        if (typeof updated[key] === "object") {
            if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
                changedFields[key] = updated[key];
            }
        } else if (updated[key] !== original[key]) {
            // If field is 0 and other is false, or field is 1 and other is true, don't count it as a change
            if (
                (isTrue(updated[key]) && isTrue(original[key])) ||
                (isFalse(updated[key]) && isFalse(original[key]))
            ) {
                continue;
            }

            // If object, check if same using JSON.stringify
            if (typeof original[key] === "object") {
                if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
                    changedFields[key] = updated[key];
                }
            }

            changedFields[key] = updated[key];
        }
    }

    return changedFields;
}

export function areFieldsEqual(original, updated) {
    return JSON.stringify(original) === JSON.stringify(updated);
}

export function isBoolean(value) {
    return typeof value === "boolean" || value instanceof Boolean || value === 0 || value === 1;
}

export function isTrue(value) {
    return value === 1 || value === true;
}

export function isFalse(value) {
    return value === 0 || value === false;
}
