---------- # SQL DATABASE ----------

DROP DATABASE IF EXISTS otp;

---------- # CREATE DATABASE ----------
CREATE DATABASE otp
	CHARSET 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';

USE otp;

---------- # CREATE TABLES ----------

---------- # 1 create students table [ENTITY] ----------
CREATE TABLE user (
	id INT NOT NULL UNIQUE AUTO_INCREMENT,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
	role ENUM('Admin', 'Visitor') NOT NULL DEFAULT 'Visitor',

    CONSTRAINT pk_user PRIMARY KEY(id)
);

CREATE TABLE otps (
	id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);