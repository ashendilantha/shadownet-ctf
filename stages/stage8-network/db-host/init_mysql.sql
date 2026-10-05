-- Create database
CREATE DATABASE IF NOT EXISTS nexacorp;
USE nexacorp;

-- Create flags table
CREATE TABLE IF NOT EXISTS flags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challenge VARCHAR(100) UNIQUE,
    flag VARCHAR(200)
);

-- Insert final flag
INSERT INTO flags (challenge, flag) VALUES ('final_breach', 'SHADOWNET{9j_3r4_3xnl3_fl4g_JI**&H_b#4gjB^$_gh%}');

-- Create user with limited permissions
CREATE USER IF NOT EXISTS 'db_user'@'%' IDENTIFIED BY 'SecurePass123';
GRANT SELECT ON nexacorp.* TO 'db_user'@'%';
FLUSH PRIVILEGES;
