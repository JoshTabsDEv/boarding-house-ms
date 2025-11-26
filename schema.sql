
USE boarding_house;

-- 2) Listings table used by the app
CREATE TABLE IF NOT EXISTS listings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  location VARCHAR(120) NOT NULL,
  price INT UNSIGNED NOT NULL,
  rooms INT UNSIGNED NOT NULL,
  status ENUM('available', 'occupied') NOT NULL DEFAULT 'available',
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;