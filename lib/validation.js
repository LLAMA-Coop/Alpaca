export const validation = {
    user: {
        username: {
            maxLength: 32,
            minLength: 2,
            error: "Must be between 2 and 32 characters",
        },

        password: {
            maxLength: 72,
            minLength: 8,
            regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/,
            error: "Must be between 8 and 72 characters and contain at least one lowercase letter, one uppercase letter, and one digit",
        },

        description: {
            maxLength: 512,
            minLength: 0,
            error: "Must be less than 512 characters",
        },

        email: {
            maxLength: 256,
            regex: /^[a-zA-Z0-9_]+@[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/,
            error: "Invalid email address",
        },
    },

    misc: {
        tag: {
            maxLength: 16,
            minLength: 1,
            error: "Must be between 1 and 16 characters",
        },
    },

    course: {
        name: {
            maxLength: 100,
            minLength: 1,
            error: "Must be between 1 and 100 characters",
        },

        description: {
            maxLength: 512,
            minLength: 0,
            error: "Must be less than 512 characters",
        },

        enrollment: {
            regex: /^(open|paid|private)$/,
            error: "Must be one of 'open', 'paid', or 'private'",
        },
    },

    group: {
        name: {
            maxLength: 100,
            minLength: 3,
            error: "Must be between 3 and 100 characters",
        },

        description: {
            maxLength: 512,
            minLength: 0,
            error: "Must be less than 512 characters",
        },
    },

    note: {
        title: {
            maxLength: 100,
            minLength: 1,
            error: "Must be between 1 and 100 characters",
        },

        text: {
            maxLength: 8192,
            minLength: 1,
            error: "Must be between 1 and 8192 characters",
        },
    },

    quiz: {
        prompt: {
            maxLength: 256,
            minLength: 1,
            error: "Must be between 1 and 256 characters",
        },

        choice: {
            maxLength: 32,
            minLength: 1,
            error: "Must be between 1 and 32 characters",
        },

        hint: {
            maxLength: 256,
            minLength: 0,
            error: "Must be less than 256 characters",
        },

        type: {
            regex: /^(prompt-response|multiple-choice|fill-in-the-blank|ordered-list-answer|unordered-list-answer|verbatim)$/,
            error: "Must be one of 'prompt-response', 'multiple-choice', 'fill-in-the-blank', 'ordered-list-answer', 'unordered-list-answer', or 'verbatim'",
        },
    },

    source: {
        title: {
            maxLength: 100,
            minLength: 1,
            error: "Must be between 1 and 100 characters",
        },

        author: {
            maxLength: 100,
            minLength: 1,
            error: "Must be between 1 and 100 characters",
        },

        medium: {
            regex: /^(book|article|video|podcast|website|other)$/,
            error: "Must be one of 'book', 'article', 'video', 'podcast', 'website', or 'other'",
        },
    },
};

export class Validator {
    constructor() {
        this.errors = {};
        this.isValid = true;
    }

    // Intended for component use
    // Setter is the useState setter
    addMessage(message, setter, doNotSend = true) {
        if (Array.isArray(setter)) {
            setter.forEach((s) => s(message));
        } else {
            setter(message);
        }
        this.errors.push(message);
        this.cannotSend = doNotSend;
    }

    addError({ field, message, dontInvalidate = false }) {
        if (typeof field !== "string" || typeof message !== "string") {
            return;
        }

        this.errors[field] = message;

        if (this.isValid && !dontInvalidate) {
            this.isValid = false;
        }
    }

    getErrorsAsString() {
        let message = "You have the following errors:\n";

        for (let field in this.errors) {
            message += `${field}: ${this.errors[field]}\n`;
        }

        return message;
    }

    validate({ field, value, type }) {
        if (!validation[type] || !validation[type][field]) {
            return true;
        }

        const { maxLength, minLength, regex, error } = validation[type][field];

        if (maxLength || minLength) {
            if (
                value.length < (minLength || 0) ||
                value.length > (maxLength || Number.MAX_SAFE_INTEGER)
            ) {
                this.addError({ field, message: error || "Invalid input" });
                this.cannotSend = true;
            }
        }

        if (regex && !regex.test(value)) {
            this.addError({ field, message: error || "Invalid input" });
            this.cannotSend = true;
        }

        return this.isValid;
    }

    validateAll(fields, type) {
        fields.forEach((field) => {
            if (type) {
                // If a type is provided, validate each field with that type
                this.validate({ ...field, type });
            } else {
                this.validate(field);
            }
        });
        return this.isValid;
    }
}
