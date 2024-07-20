CREATE TABLE IF NOT EXISTS Users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(32) NOT NULL,
    displayName VARCHAR (32),
    description VARCHAR(512),
    avatar VARCHAR(128),
    passwordHash VARCHAR(60),
    refreshTokens json NOT NULL,
);

CREATE TABLE IF NOT EXISTS Group (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(128) NOT NULL,
    description VARCHAR(512),
    isPublic BOOLEAN NOT NULL DEFAULT FALSE,
);

CREATE TABLE IF NOT EXISTS GroupUsers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    groupId BIGINT NOT NULL,
    userId BIGINT NOT NULL,
    userRole ENUM("owner", "administrator", "user"),
);