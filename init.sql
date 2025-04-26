SET default_storage_engine = InnoDB;

SET FOREIGN_KEY_CHECKS = 0;

create database IF NOT EXISTS `laundry_van`;

use laundry_van;

CREATE TABLE IF NOT EXISTS otp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(15) NOT NULL,
  otp INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE EVENT IF NOT EXISTS delete_expired_otps
ON SCHEDULE EVERY 1 MINUTE
DO
  DELETE FROM otp WHERE created_at < NOW() - INTERVAL 5 MINUTE;


-- 1. regions
CREATE TABLE IF NOT EXISTS regions (
  id              INT           AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100)  NOT NULL,
  description     TEXT          NOT NULL,
  latitude        VARCHAR(255)  NOT NULL,
  longitude       VARCHAR(255)  NOT NULL,
  thresholdDistance INT         NOT NULL
) ENGINE=InnoDB;

-- 2. users
CREATE TABLE IF NOT EXISTS users (
  id         INT           AUTO_INCREMENT PRIMARY KEY,
  fullName   VARCHAR(255)  NOT NULL,
  email      VARCHAR(255)  NOT NULL UNIQUE,
  phone      VARCHAR(15)   NOT NULL UNIQUE,
  password   VARCHAR(255),
  authType   ENUM('password','google'),
  profileUrl VARCHAR(255)  UNIQUE,
  createdAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. addresses
CREATE TABLE IF NOT EXISTS addresses (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  addressType   ENUM('Home','Work','Family'),
  user_id       INT           NOT NULL,
  region_id     INT           NOT NULL,
  addressName   VARCHAR(100)  NOT NULL,
  area          VARCHAR(100)  NOT NULL,
  buildingNumber VARCHAR(100) NOT NULL,
  landmark      VARCHAR(100),
  latitude      VARCHAR(255)  NOT NULL,
  longitude     VARCHAR(255)  NOT NULL,
  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (region_id)
    REFERENCES regions(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. services
CREATE TABLE IF NOT EXISTS services (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)   NOT NULL UNIQUE,
  description VARCHAR(200),
  iconUrl     VARCHAR(255)  NOT NULL UNIQUE,
  color       VARCHAR(10)   NOT NULL
) ENGINE=InnoDB;

-- 5. category
CREATE TABLE IF NOT EXISTS category (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  service_id  INT           NOT NULL,
  name        VARCHAR(50)   NOT NULL,
  description VARCHAR(150),
  FOREIGN KEY (service_id)
    REFERENCES services(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. items
CREATE TABLE IF NOT EXISTS items (
  id           INT           AUTO_INCREMENT PRIMARY KEY,
  category_id  INT           NOT NULL,
  name         VARCHAR(50)   NOT NULL,
  description  VARCHAR(100),
  price        DECIMAL(10,2) NOT NULL,
  iconUrl      VARCHAR(255)  NOT NULL,
  FOREIGN KEY (category_id)
    REFERENCES category(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. promotions
CREATE TABLE IF NOT EXISTS promotions (
  id                 INT             AUTO_INCREMENT PRIMARY KEY,
  title              VARCHAR(255)    NOT NULL,
  description        TEXT,
  discount_percentage DECIMAL(5,2),
  fixed_discount     DECIMAL(5,2),
  threshHold         DECIMAL(5,2)    NOT NULL,
  coupon_code        VARCHAR(50)     UNIQUE,
  valid_from         DATE,
  valid_to           DATE,
  promotionImageUrl  VARCHAR(255) NOT NULL,
  is_active          BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE EVENT IF NOT EXISTS deactivate_expired_promotions
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  UPDATE promotions
  SET is_active = FALSE
  WHERE valid_to < CURDATE()
    AND is_active = TRUE;

-- 8. vans
CREATE TABLE IF NOT EXISTS vans (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  region_id   INT           NOT NULL,
  van_number  VARCHAR(255)  NOT NULL,
  phone       VARCHAR(50)   NOT NULL UNIQUE,
  status      BOOLEAN       NOT NULL DEFAULT TRUE,
  createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id)
    REFERENCES regions(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. order_status_names
CREATE TABLE IF NOT EXISTS order_status_names (
  id         INT           AUTO_INCREMENT PRIMARY KEY,
  statusName VARCHAR(50)   NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 10. orders
CREATE TABLE IF NOT EXISTS orders (
  id             INT              AUTO_INCREMENT PRIMARY KEY,
  user_id        INT              NOT NULL,
  address        INT              NOT NULL,
  region_id      INT,
  driver_id      INT,
  order_status   INT,
  pickup_time    TIME             NOT NULL,
  pickup_date    DATE             NOT NULL,
  delivery_date  DATE             NOT NULL,
  delivery_time  TIME             NOT NULL,
  promotion_id   INT,
  payment_mode   ENUM('cash','online') NOT NULL,
  payment_status BOOLEAN         NOT NULL DEFAULT FALSE,
  order_total    DECIMAL(5,2)     NOT NULL,
  createdAt      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (address)
    REFERENCES addresses(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  FOREIGN KEY (region_id)
    REFERENCES regions(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  FOREIGN KEY (driver_id)
    REFERENCES vans(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  FOREIGN KEY (order_status)
    REFERENCES order_status_names(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  FOREIGN KEY (promotion_id)
    REFERENCES promotions(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 11. order_items
CREATE TABLE IF NOT EXISTS order_items (
  id         INT           AUTO_INCREMENT PRIMARY KEY,
  order_id   INT           NOT NULL,
  item_id    INT           NOT NULL,
  quantity   INT           NOT NULL,
  FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (item_id)
    REFERENCES items(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 12. order_status_history
CREATE TABLE IF NOT EXISTS order_status_history (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  order_id    INT           NOT NULL,
  order_status INT          NOT NULL,
  createdAt   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (order_status)
    REFERENCES order_status_names(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 13. logistics_ledger
CREATE TABLE IF NOT EXISTS logistics_ledger (
  id           INT           AUTO_INCREMENT PRIMARY KEY,
  order_id     INT           NOT NULL,
  pickedUp_at  TIMESTAMP,
  pickedUp_by  INT,
  delivered_at TIMESTAMP,
  delivered_by INT,
  FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (pickedUp_by)
    REFERENCES vans(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  FOREIGN KEY (delivered_by)
    REFERENCES vans(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 14. admin
CREATE TABLE IF NOT EXISTS admin (
  id        INT           AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(50),
  email     VARCHAR(200),
  password  VARCHAR(255),
  createdAt TIMESTAMP
) ENGINE=InnoDB;

-- Re‐enable FK checks
SET FOREIGN_KEY_CHECKS = 1;