import { isValidId } from "./random";

export const validation = {
  user: {
    username: {
      type: "string",
      maxLength: 32,
      minLength: 2,
      regex: /^.{2,32}$/,
      error: "Must be between 2 and 32 characters",
    },

    password: {
      type: "string",
      maxLength: 72,
      minLength: 8,
      regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/,
      error:
        "Must be between 8 and 72 characters and contain at least one lowercase letter, one uppercase letter, and one digit",
    },

    description: {
      type: "string",
      maxLength: 512,
      minLength: 0,
      error: "Must be less than 512 characters",
    },

    email: {
      type: "string",
      maxLength: 75,
      regex: /^[a-zA-Z0-9_]+@[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/,
      error: "Invalid email address",
    },
  },

  misc: {
    tag: {
      type: "string",
      maxLength: 16,
      minLength: 1,
      error: "Must be between 1 and 16 characters",
    },

    tags: {
      type: "array",
      maxSize: 20,
      values: {
        type: "string",
        maxLength: 16,
        minLength: 1,
        error: "Must be between 1 and 16 characters",
      },
      error: "Cannot have more than 20 tags",
    },
  },

  course: {
    name: {
      type: "string",
      maxLength: 100,
      minLength: 1,
      error: "Must be between 1 and 100 characters",
    },

    description: {
      type: "string",
      maxLength: 512,
      minLength: 1,
      error: "Must be less than 512 characters",
    },

    enrollment: {
      type: "string",
      regex: /^(open|paid|private)$/,
      error: "Must be one of 'open', 'paid', or 'private'",
    },
  },

  group: {
    name: {
      type: "string",
      maxLength: 100,
      minLength: 3,
      error: "Must be between 3 and 100 characters",
    },

    description: {
      type: "string",
      maxLength: 512,
      minLength: 0,
      error: "Must be less than 512 characters",
    },

    icon: {
      type: "string",
      maxLength: 100,
      minLength: 0,
      error: "Must be less than 100 characters",
    },
  },

  note: {
    title: {
      type: "string",
      maxLength: 100,
      minLength: 1,
      error: "Must be between 1 and 100 characters",
    },

    text: {
      type: "string",
      maxLength: 8192,
      minLength: 1,
      error: "Must be between 1 and 8192 characters",
    },
  },

  quiz: {
    prompt: {
      type: "string",
      maxLength: 256,
      minLength: 1,
      error: "Must be between 1 and 256 characters",
    },

    choice: {
      type: "string",
      maxLength: 32,
      minLength: 1,
      error: "Must be between 1 and 32 characters",
    },

    choices: {
      type: "array",
      maxSize: 10,
      values: {
        type: "string",
        maxLength: 32,
        minLength: 1,
        error: "Must be between 1 and 32 characters",
      },
      error: "Cannot have more than 10 choices",
    },

    answers: {
      type: "array",
      minSize: 1,
      values: {
        type: "string",
        maxLength: 45,
        minLength: 1,
        error: "Must be between 1 and 45 characters",
      },
    },

    hint: {
      type: "string",
      maxLength: 256,
      minLength: 0,
      error: "Must be less than 256 characters",
    },

    hints: {
      type: "array",
      maxSize: 10,
      values: {
        type: "string",
        maxLength: 256,
        minLength: 0,
        error: "Must be less than 256 characters",
      },
      error: "Cannot have more than 10 hints",
    },

    type: {
      type: "string",
      regex:
        /^(prompt-response|multiple-choice|fill-in-the-blank|ordered-list-answer|unordered-list-answer|verbatim)$/,
      error:
        "Must be one of 'prompt-response', 'multiple-choice', 'fill-in-the-blank', 'ordered-list-answer', 'unordered-list-answer', or 'verbatim'",
    },
  },

  source: {
    title: {
      type: "string",
      maxLength: 100,
      minLength: 1,
      error: "Must be between 1 and 100 characters",
    },

    medium: {
      type: "string",
      regex: /^(book|article|video|podcast|website|other)$/,
      error:
        "Must be one of 'book', 'article', 'video', 'podcast', 'website', or 'other'",
    },

    url: {
      type: "string",
      maxLength: 512,
      minLength: 0,
      regex: /^https?:\/\/.*/,
      error: "Must be less than 512 characters",
    },

    publishedAt: {
      type: "date",
      error: "Invalid date",
    },

    lastAccessed: {
      type: "date",
      error: "Invalid date",
    },

    author: {
      type: "string",
      maxLength: 100,
      minLength: 1,
      error: "Must be between 1 and 100 characters",
    },

    authors: {
      type: "array",
      maxSize: 10,
      values: {
        type: "string",
        maxLength: 100,
        minLength: 1,
        error: "Must be between 1 and 100 characters",
      },
      error: "Cannot have more than 10 authors",
    },
  },

  report: {
    type: {
      type: "string",
      regex: /^(spam|harassment|hate-speech|violence|nudity|other)$/,
      error:
        "Must be one of 'spam', 'harassment', 'hate-speech', 'violence', 'nudity', or 'other'",
    },

    reason: {
      type: "string",
      maxLength: 256,
      error: "Must be less than 256 characters",
    },

    link: {
      type: "string",
      maxLength: 256,
      error: "Must be less than 256 characters",
    },
  },

  message: {
    title: {
      type: "string",
      maxLength: 100,
      error: "Must be less than 100 characters",
    },

    message: {
      type: "string",
      maxLength: 1024,
      minLength: 1,
      error: "Must be between 1 and 1024 characters",
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
    if (typeof field !== "string") {
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

  validate({ field, value, type, isSubfield }) {
    if (!validation[type] || !validation[type][field] || !value) {
      return true;
    }

    const item = !isSubfield
      ? validation[type][field]
      : validation[type][field]["values"];

    const {
      type: item_type,
      minSize,
      maxSize,
      maxLength,
      minLength,
      regex,
      error,
      values,
    } = item;

    // Check value's type
    if (
      item_type &&
      (item_type === "array"
        ? !Array.isArray(value)
        : item_type === "date"
          ? !new Date(value).getTime()
          : typeof value !== item_type)
    ) {
      this.addError({ field, message: error || "Invalid input" });
      return (this.cannotSend = true);
    }

    if (regex && !regex.test(value)) {
      this.addError({ field, message: error || "Invalid input" });
      this.cannotSend = true;
    }

    if (item_type === "string" && !minLength && value === "") {
      return this.isValid;
    }

    // Check array size
    if (item_type === "array") {
      if (maxSize && value.length > maxSize) {
        this.addError({ field, message: error || "Invalid input" });
        this.cannotSend = true;
      }

      if (minSize && value.length < minSize) {
        this.addError({ field, message: error || "Invalid input" });
        this.cannotSend = true;
      }

      if (values) {
        value.forEach((v) => {
          this.validate({ field, value: v, type, isSubfield: true });
        });
      }
    }

    if (maxLength || minLength) {
      if (
        value.length < (minLength || 0) ||
        value.length > (maxLength || Number.MAX_SAFE_INTEGER)
      ) {
        this.addError({ field, message: error || "Invalid input" });
        this.cannotSend = true;
      }
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

  validatePermissions(
    { allRead, allWrite, read, write, groupId, groupLocked },
    needsStringify = false
  ) {

    const errors = {};

    if (allRead && typeof allRead !== "boolean" && ![0, 1].includes(allRead)) {
      errors.allRead = "allRead must be a boolean";
    }

    if (
      allWrite &&
      typeof allWrite !== "boolean" &&
      ![0, 1].includes(allWrite)
    ) {
      errors.allWrite = "allWrite must be a boolean";
    }

    if (
      groupLocked &&
      typeof groupLocked !== "boolean" &&
      ![0, 1].includes(groupLocked)
    ) {
      errors.groupLocked = "groupLocked must be a boolean";
    }

    if (read && !Array.isArray(read)) {
      errors.read = "read must be an array";
    } else if (read && !Array.isArray(read)) {
      read.forEach((p) => {
        if (typeof p !== "number")
          errors.read = "read must be array of numbers";
      });
    }

    if (write && !Array.isArray(write)) {
      errors.write = "write must be an array";
    } else if (write && !Array.isArray(write)) {
      write.forEach((p) => {
        if (typeof p !== "number")
          errors.write = "write must be array of numbers";
      });
    }

    if (groupId && !isValidId(groupId)) {
      errors.groupId = "groupId must be a valid id";
    }

    if (Object.keys(errors).length) {
      this.addError({ field: "permissions", message: errors });
      return (this.cannotSend = true);
    }

    return {
      allRead: allWrite ? true : allRead,
      allWrite,
      read: needsStringify ? JSON.stringify(read) : read,
      write: needsStringify ? JSON.stringify(write) : write,
      groupId,
      groupLocked,
    };
  }
}
