export const validation = {
    username: {
        maxLength: 32,
        minLength: 2,
    },

    password: {
        maxLength: 72,
        minLength: 8,
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/,
    },

    description: {
        maxLength: 512,
        minLength: 0,
    },

    email: {
        maxLength: 256,
        regex: /^[a-zA-Z0-9_]+@[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/,
    },

    tag: {
        maxLength: 16,
        minLength: 1,
    },

    course: {
        name: {
            maxLength: 100,
            minLength: 1,
        },
        description: {
            maxLength: 512,
            minLength: 0,
        },
    },

    group: {
        name: {
            maxLength: 100,
            minLength: 3,
        },
        description: {
            maxLength: 512,
            minLength: 0,
        },
    },

    note: {
        title: {
            maxLength: 100,
            minLength: 1,
        },
        text: {
            maxLength: 8192,
            minLength: 0,
        },
    },

    quiz: {
        prompt: {
            maxLength: 256,
            minLength: 1,
        },
        response: {
            maxLength: 32,
            minLength: 1,
        },
        choice: {
            maxLength: 32,
            minLength: 1,
        },
    },

    source: {
        title: {
            maxLength: 100,
            minLength: 1,
        },
        authors: {
            maxLength: 100,
            minLength: 1,
        },
    },
};
