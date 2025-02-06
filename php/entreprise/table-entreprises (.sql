CREATE TABLE entreprises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE surveys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enterprise_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('draft', 'active', 'completed') DEFAULT 'draft',
    questions_count INT DEFAULT 0,
    responses_count INT DEFAULT 0,
    FOREIGN KEY (enterprise_id) REFERENCES entreprises(id)
);
