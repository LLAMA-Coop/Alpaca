export const MAX = {
    username: 32,
    author: 64,
    displayName: 32,
    description: 512,
    email: 256,
    // --- //
    tag: 16,
    // --- //
    courseName: 100,
    courseDescription: 512,
    // --- //
    groupName: 100,
    groupDescription: 512,
    // --- //
    noteTitle: 100,
    noteText: 8192,
    // --- //
    quizzPrompt: 256,
    quizzResponse: 32,
    quizzChoice: 32,
    // --- //
    sourceTitle: 100,
};

export const MIN = {
    username: 2,
    author: 2,
    displayName: 2,
    description: 0,
    email: 5,
    // --- //
    tag: 1,
    // --- //
    courseName: 1,
    courseDescription: 0,
    // --- //
    groupName: 3,
    groupDescription: 0,
    // --- //
    noteTitle: 1,
    noteText: 0,
    // --- //
    quizzPrompt: 1,
    quizzResponse: 1,
    quizzChoice: 1,
    // --- //
    sourceTitle: 1,
};

export const REGEX = {
    username: /^[a-zA-Z0-9_]+$/,
    displayName: /^[a-zA-Z0-9_ ]+$/,
    email: /^[a-zA-Z0-9_]+@[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/,
    phone: /^[0-9]{10}$/,
};

export const DEFAULT = {};

export const NOTIFICATION_TYPE = {
    0: "SYSTEM",
    1: "ASSOCIATE_REQUEST",
    2: "GROUP_INVITE",
    3: "GROUP_REQUEST",
};
