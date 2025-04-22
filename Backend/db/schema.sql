CREATE TABLE IF NOT EXISTS dispositivo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    ubicacion VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS lecturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100),
    temperatura FLOAT,
    presion FLOAT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES dispositivo(device_id)
);

CREATE TABLE IF NOT EXISTS valvula (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100),
    estado ENUM('OPEN', 'CLOSE') NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES dispositivo(device_id)
);