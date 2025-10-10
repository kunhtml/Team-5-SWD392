-- =====================================================
-- COMPLETE DATABASE SETUP FOR FLOWERSHOPPING PROJECT (FULL FIXED VERSION + NEW ADMIN WITH HASH)
-- =====================================================
--            Email                       Mật Khẩu Gốc (Plain Text)    Ghi Chú

--    newadmin@flowershop.com                admin456                     Admin
-- =====================================================

-- =====================================================
-- Step 0: Drop and Recreate Database (DESTRUCTIVE - Backup first!)
-- =====================================================
DROP DATABASE IF EXISTS flowershop_mysql; 

CREATE DATABASE IF NOT EXISTS flowershop_mysql 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE flowershop_mysql;

-- =====================================================
-- Step 1: Set character set and basic settings
-- =====================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET SQL_SAFE_UPDATES = 0;  -- FIX: Disable safe updates for this session (bypass Error 1175)

-- =====================================================
-- Step 2: Create Core Tables (Users, Categories, Shops)
-- =====================================================

-- Users table (for customers, florists, admins)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('customer', 'florist', 'admin') DEFAULT 'customer',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table (for flower types)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shops table (for florist stores) - Core columns only (stats added below)
CREATE TABLE shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    image_url VARCHAR(255),
    florist_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (florist_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_florist_id (florist_id),
    INDEX idx_status (status),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Add Shop Stats Columns with Separate ALTER TABLE (SIMPLE FIX: No procedure, no sync error)
-- =====================================================
-- Add each column one by one (safe, no IF NOT EXISTS needed since DB is fresh)

ALTER TABLE shops ADD COLUMN total_revenue DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Total revenue from all orders';
ALTER TABLE shops ADD COLUMN total_products INT DEFAULT 0 COMMENT 'Total active products';
ALTER TABLE shops ADD COLUMN pending_orders INT DEFAULT 0 COMMENT 'Pending/processing orders';
ALTER TABLE shops ADD COLUMN completed_orders INT DEFAULT 0 COMMENT 'Completed/delivered orders';
ALTER TABLE shops ADD COLUMN cancelled_orders INT DEFAULT 0 COMMENT 'Cancelled/rejected orders';
ALTER TABLE shops ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Average shop rating';
ALTER TABLE shops ADD COLUMN total_reviews INT DEFAULT 0 COMMENT 'Total shop reviews';
-- NEW: Product review stats
ALTER TABLE shops ADD COLUMN average_product_rating DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Average product rating for shop';
ALTER TABLE shops ADD COLUMN total_product_reviews INT DEFAULT 0 COMMENT 'Total product reviews for shop';

-- Add composite index for shop stats
ALTER TABLE shops ADD INDEX idx_shop_stats (total_revenue, total_products, pending_orders);

-- =====================================================
-- Step 3: Create Product-Related Tables
-- =====================================================

-- Products table (FIXED: Correct FULLTEXT syntax)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    category_id INT NOT NULL,
    shop_id INT NOT NULL,
    image_url VARCHAR(255),
    images JSON,  -- Array of image URLs
    status ENUM('active', 'inactive', 'out_of_stock', 'pending', 'rejected') DEFAULT 'active',
    is_featured TINYINT DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    tags JSON,  -- Array of tags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_category_id (category_id),
    INDEX idx_shop_id (shop_id),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured),
    FULLTEXT KEY idx_name_description (name, description)  -- FIXED: Correct syntax
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shop Requests table (for shop approval)
CREATE TABLE shop_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shop_name VARCHAR(100) NOT NULL,
    business_description TEXT,
    address TEXT,
    phone VARCHAR(20),
    business_email VARCHAR(255),  -- NEW: Added business_email column
    business_license VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    wallet_balance_at_request DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- After the shop_requests table creation, add missing columns for processing
ALTER TABLE shop_requests 
ADD COLUMN admin_note TEXT COMMENT 'Admin notes for approval/rejection',
ADD COLUMN processed_at TIMESTAMP NULL COMMENT 'When the request was processed',
ADD COLUMN processed_by INT NULL COMMENT 'Admin user who processed the request',
ADD FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
ADD INDEX idx_processed_by (processed_by);

-- =====================================================
-- Step 4: Create Order and Payment Tables
-- =====================================================

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shop_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    payment_method ENUM('cash', 'card', 'wallet', 'bank_transfer') DEFAULT 'cash',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    notes TEXT,
    is_special_order TINYINT DEFAULT 0 COMMENT '0 = Regular order, 1 = Special order',
    special_request TEXT COMMENT 'Special requirements for the order',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_shop_id (shop_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_is_special_order (is_special_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items (products in orders)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,  -- Price at time of order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Special Order Requests table (for customer requests for special orders)
CREATE TABLE special_order_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    budget DECIMAL(10,2),
    quantity INT DEFAULT 1,
    delivery_date DATE,
    shipping_address TEXT NOT NULL,
    additional_notes TEXT,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    assigned_shop_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_shop_id) REFERENCES shops(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_assigned_shop_id (assigned_shop_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wallet table (user balances)
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wallet Transactions (FIXED: Use wallet_id to match model)
CREATE TABLE wallet_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    type ENUM('deposit', 'payment', 'refund', 'withdrawal') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    balance_after DECIMAL(15,2) NOT NULL,
    reference_id VARCHAR(255),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    INDEX idx_wallet_id (wallet_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Withdrawal Requests
CREATE TABLE withdrawal_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'processed') DEFAULT 'pending',
    bank_account VARCHAR(255),
    bank_name VARCHAR(100),
    notes TEXT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seller Stats (legacy, can be migrated to shops)
CREATE TABLE seller_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,  -- References user_id (florist)
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    total_products INT DEFAULT 0,
    pending_orders INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_seller_id (seller_id),
    INDEX idx_seller_id (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Step 5: Create Additional Tables (Moderation, Reviews)
-- =====================================================

-- Product Moderation (if needed for admin approval)
ALTER TABLE products 
ADD COLUMN moderation_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
ADD COLUMN moderation_note TEXT,
ADD COLUMN moderated_at TIMESTAMP NULL;

-- Shop Reviews table (for shop ratings - existing, with shop_id)
CREATE TABLE shop_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shop_id INT NOT NULL,  -- LINK: Review for which shop
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_shop_id (shop_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NEW: Product Reviews table (dedicated for product/item reviews, with shop_id)
CREATE TABLE product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,  -- Customer who reviewed
    product_id INT NOT NULL,  -- The product being reviewed
    shop_id INT NOT NULL,  -- LINK: Review for which shop (product's shop)
    order_id INT,  -- Link to order (optional, for verification)
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    images JSON,  -- Optional: Review photos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    UNIQUE KEY uk_user_product (user_id, product_id),  -- Prevent duplicate reviews per user/product
    INDEX idx_product_id (product_id),
    INDEX idx_shop_id (shop_id),
    INDEX idx_status (status),
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Step 6: Insert Sample Data (UPDATED: Added new admin with bcrypt hash)
-- =====================================================

-- Sample Categories
INSERT INTO categories (name, description, image_url, is_active) VALUES
('Hoa Sinh Nhật', 'Hoa dành cho sinh nhật', '/images/categories/birthday.jpg', 1),
('Hoa Cưới', 'Hoa cưới và sự kiện', '/images/categories/wedding.jpg', 1),
('Hoa Tình Yêu', 'Hoa dành cho người yêu', '/images/categories/love.jpg', 1),
('Hoa Khai Trương', 'Hoa khai trương kinh doanh', '/images/categories/business.jpg', 1),
('Hoa Tang Lễ', 'Hoa viếng tang', '/images/categories/funeral.jpg', 1);

-- Sample Users (old users with placeholder, + NEW ADMIN with bcrypt hash)
INSERT INTO users (name, email, password, role, phone, status) VALUES
('Admin User', 'admin@flowershop.com', '$2b$10$hashedpassword', 'admin', '0123456789', 'active'),  -- Old admin (placeholder - update if needed)
('Demo Florist', 'demo@flowershop.com', '$2b$10$hashedpassword', 'florist', '0987654321', 'active'),  -- Old florist
('Demo Customer', 'customer@flowershop.com', '$2b$10$hashedpassword', 'customer', '0111222333', 'active'),  -- Old customer
('New Admin', 'newadmin@flowershop.com', '$2b$10$/s1aL9pVeCfvBOFW0KygAeK8geB4ldAPNCr3rBOhWQ.QhrfDzpJWS', 'admin', '0999888777', 'active');  -- NEW ADMIN with hash of "admin456"

-- Sample Wallet for users (including new admin)
INSERT INTO wallets (user_id, balance) VALUES
(1, 1000000.00),  -- Old Admin
(2, 670000.00),   -- Florist
(3, 50000.00),    -- Customer
(4, 500000.00);   -- New Admin

-- Sample Shop for florist (user_id=2)
INSERT INTO shops (name, description, address, phone, email, florist_id, status, rating) VALUES
('Demo Flower Shop', 'Cửa hàng hoa tươi đẹp', '123 Demo Street, Hanoi', '0987654321', 'demo@shop.com', 2, 'approved', 4.5);

-- Sample Products
INSERT INTO products (name, description, price, stock, category_id, shop_id, image_url, status, is_featured) VALUES
('Hoa Hồng Đỏ', 'Bó hoa hồng đỏ 10 cành', 250000.00, 50, 3, 1, '/images/products/rose-red.jpg', 'active', 1),
('Hoa Cúc Vàng', 'Bó hoa cúc vàng tươi', 150000.00, 30, 1, 1, '/images/products/chrysanthemum.jpg', 'active', 0),
('Hoa Lan Trắng', 'Bó hoa lan trắng sang trọng', 350000.00, 20, 2, 1, '/images/products/orchid-white.jpg', 'active', 1);

-- Sample Seller Stats (legacy)
INSERT INTO seller_stats (seller_id, total_revenue, total_orders, total_products, pending_orders) VALUES
(2, 0.00, 0, 3, 0);  -- For florist user_id=2

-- Sample Orders
INSERT INTO orders (user_id, shop_id, total_amount, status, shipping_address, payment_method) VALUES
(3, 1, 250000.00, 'completed', '456 Customer Street, Hanoi', 'wallet'),
(3, 1, 150000.00, 'pending', '456 Customer Street, Hanoi', 'cash');

-- Sample Order Items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 250000.00),
(2, 2, 1, 150000.00);

-- Sample Withdrawal Request
INSERT INTO withdrawal_requests (user_id, amount, status, bank_account, bank_name) VALUES
(2, 500000.00, 'pending', '123456789', 'Vietcombank');

-- Sample Shop Reviews (with explicit shop_id = 1 for Demo Flower Shop)
INSERT INTO shop_reviews (user_id, shop_id, rating, comment, status) VALUES
(3, 1, 5, 'Cửa hàng tuyệt vời! Dịch vụ tốt, hoa tươi.', 'approved');  -- Review for shop_id=1

-- NEW: Sample Product Reviews (with explicit shop_id = 1 for Demo Flower Shop)
INSERT INTO product_reviews (user_id, product_id, shop_id, order_id, rating, comment, status) VALUES
(3, 1, 1, 1, 5, 'Hoa hồng đẹp từ Demo Flower Shop, giao hàng nhanh!', 'approved'),  -- Review for product 1, shop 1
(3, 2, 1, NULL, 4, 'Hoa cúc tươi từ Demo Flower Shop, giá hợp lý.', 'approved');  -- Review for product 2, shop 1

-- Sample Special Order Requests
INSERT INTO special_order_requests (user_id, product_name, description, category, budget, quantity, delivery_date, shipping_address, additional_notes) VALUES
(3, 'Custom Birthday Bouquet', 'A custom bouquet with red roses and white lilies for a birthday', 'Hoa Sinh Nhật', 500000.00, 1, '2023-12-25', '456 Customer Street, Hanoi', 'Please deliver in the morning'),
(3, 'Wedding Flower Arrangement', 'Elegant white and pink flower arrangement for wedding ceremony', 'Hoa Cưới', 1500000.00, 2, '2024-01-15', '789 Wedding Venue, Hanoi', 'Need to match wedding theme colors');

-- =====================================================
-- Step 7: Populate Shop Stats from Data (FIXED: JOINs + WHERE clauses)
-- =====================================================
-- Run after sample data. Uses JOINs + WHERE for safety and performance.

-- Update total_products (via JOIN + WHERE)
UPDATE shops s
LEFT JOIN (
    SELECT shop_id, COUNT(*) as active_count
    FROM products 
    WHERE status = 'active'
    GROUP BY shop_id
) p ON s.id = p.shop_id
SET s.total_products = COALESCE(p.active_count, 0)
WHERE s.id > 0;  -- Safe mode compliant (uses PRIMARY KEY id)

-- Update total_revenue (via JOIN + WHERE)
UPDATE shops s
LEFT JOIN (
    SELECT shop_id, SUM(total_amount) as rev_sum
    FROM orders 
    WHERE status IN ('completed', 'delivered')
    GROUP BY shop_id
) o ON s.id = o.shop_id
SET s.total_revenue = COALESCE(o.rev_sum, 0.00)
WHERE s.id > 0;  -- Safe mode compliant

-- Update pending_orders (via JOIN + WHERE)
UPDATE shops s
LEFT JOIN (
    SELECT shop_id, COUNT(*) as pending_count
    FROM orders 
    WHERE status IN ('pending', 'processing')
    GROUP BY shop_id
) o ON s.id = o.shop_id
SET s.pending_orders = COALESCE(o.pending_count, 0)
WHERE s.id > 0;  -- Safe mode compliant

-- Update completed_orders (via JOIN + WHERE)
UPDATE shops s
LEFT JOIN (
    SELECT shop_id, COUNT(*) as completed_count
    FROM orders 
    WHERE status IN ('completed', 'delivered')
    GROUP BY shop_id
) o ON s.id = o.shop_id
SET s.completed_orders = COALESCE(o.completed_count, 0)
WHERE s.id > 0;  -- Safe mode compliant

-- Update cancelled_orders (simple SET with WHERE to satisfy safe mode)
UPDATE shops 
SET cancelled_orders = 0 
WHERE id > 0;  -- Already safe

-- Update average_rating and total_reviews from shop_reviews (via JOIN + WHERE)
UPDATE shops s
LEFT JOIN (
    SELECT shop_id, 
           AVG(rating) as avg_rating,
           COUNT(*) as review_count
    FROM shop_reviews 
    WHERE status = 'approved'
    GROUP BY shop_id
) r ON s.id = r.shop_id
SET s.average_rating = COALESCE(r.avg_rating, 0.00),
    s.total_reviews = COALESCE(r.review_count, 0)
WHERE s.id > 0;  -- Safe mode compliant

-- NEW: Update average_product_rating and total_product_reviews from product_reviews (via JOIN + WHERE)
UPDATE shops s
LEFT JOIN (
    SELECT shop_id, 
           AVG(rating) as avg_product_rating,
           COUNT(*) as product_review_count
    FROM product_reviews 
    WHERE status = 'approved'
    GROUP BY shop_id
) pr ON s.id = pr.shop_id
SET s.average_product_rating = COALESCE(pr.avg_product_rating, 0.00),
    s.total_product_reviews = COALESCE(pr.product_review_count, 0)
WHERE s.id > 0;  -- Safe mode compliant

-- =====================================================
-- Step 8: Create Triggers for Auto-Updates
-- =====================================================

DELIMITER //

-- Product Triggers
CREATE TRIGGER update_shop_total_products_insert
AFTER INSERT ON products
FOR EACH ROW
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE shops SET total_products = total_products + 1 WHERE id = NEW.shop_id;
    END IF;
END//

CREATE TRIGGER update_shop_total_products_update
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF OLD.status != 'active' AND NEW.status = 'active' THEN
        UPDATE shops SET total_products = total_products + 1 WHERE id = NEW.shop_id;
    ELSEIF OLD.status = 'active' AND NEW.status != 'active' THEN
        UPDATE shops SET total_products = total_products - 1 WHERE id = NEW.shop_id;
    END IF;
END//

CREATE TRIGGER update_shop_total_products_delete
AFTER DELETE ON products
FOR EACH ROW
BEGIN
    IF OLD.status = 'active' THEN
        UPDATE shops SET total_products = total_products - 1 WHERE id = OLD.shop_id;
    END IF;
END//

-- NEW: Triggers for Product Reviews (update shop stats on insert/update/delete)
CREATE TRIGGER update_shop_product_reviews_insert
AFTER INSERT ON product_reviews
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' THEN
        UPDATE shops s 
        SET total_product_reviews = total_product_reviews + 1,
            average_product_rating = (
                SELECT AVG(rating) 
                FROM product_reviews pr 
                WHERE pr.shop_id = NEW.shop_id AND pr.status = 'approved'
            )
        WHERE s.id = NEW.shop_id;
    END IF;
END//

CREATE TRIGGER update_shop_product_reviews_update
AFTER UPDATE ON product_reviews
FOR EACH ROW
BEGIN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
        -- New approval: increment count and recalc avg
        UPDATE shops s 
        SET total_product_reviews = total_product_reviews + 1,
            average_product_rating = (
                SELECT AVG(rating) 
                FROM product_reviews pr 
                WHERE pr.shop_id = NEW.shop_id AND pr.status = 'approved'
            )
        WHERE s.id = NEW.shop_id;
    ELSEIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
        -- Rejection: decrement count and recalc avg
        UPDATE shops s 
        SET total_product_reviews = total_product_reviews - 1,
            average_product_rating = (
                SELECT AVG(rating) 
                FROM product_reviews pr 
                WHERE pr.shop_id = OLD.shop_id AND pr.status = 'approved'
            )
        WHERE s.id = OLD.shop_id;
    ELSEIF OLD.status = 'approved' AND NEW.status = 'approved' AND OLD.rating != NEW.rating THEN
        -- Rating change: recalc avg only
        UPDATE shops s 
        SET average_product_rating = (
            SELECT AVG(rating) 
            FROM product_reviews pr 
            WHERE pr.shop_id = NEW.shop_id AND pr.status = 'approved'
        )
        WHERE s.id = NEW.shop_id;
    END IF;
END//

CREATE TRIGGER update_shop_product_reviews_delete
AFTER DELETE ON product_reviews
FOR EACH ROW
BEGIN
    IF OLD.status = 'approved' THEN
        UPDATE shops s 
        SET total_product_reviews = total_product_reviews - 1,
            average_product_rating = (
                SELECT AVG(rating) 
                FROM product_reviews pr 
                WHERE pr.shop_id = OLD.shop_id AND pr.status = 'approved'
            )
        WHERE s.id = OLD.shop_id;
    END IF;
END//

-- Order Triggers (FIXED: Prevent double revenue on status chains like delivered -> completed)
CREATE TRIGGER update_shop_order_stats
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'completed' THEN
                UPDATE shops SET 
                    completed_orders = completed_orders + 1,
                    total_revenue = CASE WHEN OLD.status NOT IN ('delivered', 'completed') 
                                         THEN total_revenue + COALESCE(NEW.total_amount, 0) 
                                         ELSE total_revenue END,
                    pending_orders = pending_orders - (CASE WHEN OLD.status IN ('pending', 'processing') THEN 1 ELSE 0 END)
                WHERE id = NEW.shop_id;
            WHEN 'delivered' THEN
                UPDATE shops SET 
                    completed_orders = completed_orders + 1,
                    total_revenue = CASE WHEN OLD.status NOT IN ('delivered', 'completed') 
                                         THEN total_revenue + COALESCE(NEW.total_amount, 0) 
                                         ELSE total_revenue END
                WHERE id = NEW.shop_id;
            WHEN 'pending' THEN
                UPDATE shops SET pending_orders = pending_orders + 1 WHERE id = NEW.shop_id;
            WHEN 'processing' THEN
                UPDATE shops SET pending_orders = pending_orders + 1 WHERE id = NEW.shop_id;
            WHEN 'cancelled' THEN
                UPDATE shops SET 
                    cancelled_orders = cancelled_orders + 1,
                    pending_orders = pending_orders - (CASE WHEN OLD.status IN ('pending', 'processing') THEN 1 ELSE 0 END)
                WHERE id = NEW.shop_id;
            WHEN 'rejected' THEN
                UPDATE shops SET 
                    cancelled_orders = cancelled_orders + 1,
                    pending_orders = pending_orders - (CASE WHEN OLD.status IN ('pending', 'processing') THEN 1 ELSE 0 END)
                WHERE id = NEW.shop_id;
        END CASE;
    END IF;
END//

DELIMITER ;

-- =====================================================
-- Step 9: Final Verification (UPDATED: Check new admin)
-- =====================================================

-- Show all tables
SHOW TABLES;

-- Describe key tables (verify stats columns added, including product review stats)
DESCRIBE users;
DESCRIBE shops;
DESCRIBE products;
DESCRIBE orders;
DESCRIBE shop_reviews;
DESCRIBE product_reviews;

-- Sample queries to verify data
SELECT 'Users Count' AS info, COUNT(*) AS count FROM users;
SELECT 'Shops Count' AS info, COUNT(*) AS count FROM shops;
SELECT 'Products Count' AS info, COUNT(*) AS count FROM products;
SELECT 'Orders Count' AS info, COUNT(*) AS count FROM orders;
SELECT 'Shop Reviews Count' AS info, COUNT(*) AS count FROM shop_reviews;
SELECT 'Product Reviews Count' AS info, COUNT(*) AS count FROM product_reviews;
SELECT 'Special Order Requests Count' AS info, COUNT(*) AS count FROM special_order_requests;

-- NEW: Verify all users (including new admin)
SELECT id, name, email, role, LEFT(password, 30) AS password_preview, status FROM users ORDER BY id;

-- Sample shop with stats (verify columns, including product review stats)
SELECT id, name, total_revenue, total_products, pending_orders, average_rating, total_reviews, average_product_rating, total_product_reviews FROM shops LIMIT 3;

-- UPDATED: Sample shop reviews (show which shop the review is for)
SELECT sr.id, u.name AS reviewer, s.name AS shop_name, sr.rating, sr.comment, sr.status 
FROM shop_reviews sr
JOIN users u ON sr.user_id = u.id
JOIN shops s ON sr.shop_id = s.id;  -- LINK: Show shop name

-- UPDATED: Sample product reviews (show which shop the review is for)
SELECT pr.id, p.name AS product_name, u.name AS reviewer, s.name AS shop_name, pr.rating, pr.comment, pr.status 
FROM product_reviews pr
JOIN products p ON pr.product_id = p.id
JOIN users u ON pr.user_id = u.id
JOIN shops s ON pr.shop_id = s.id;  -- LINK: Show shop name

-- NEW: Sample query - Reviews for a specific shop (e.g., shop_id = 1)
SELECT 'Reviews for Demo Flower Shop (ID=1)' AS info;
SELECT 'Shop Review' AS type, u.name AS reviewer, sr.rating, sr.comment FROM shop_reviews sr
JOIN users u ON sr.user_id = u.id WHERE sr.shop_id = 1 AND sr.status = 'approved'
UNION ALL
SELECT 'Product Review' AS type, u.name AS reviewer, pr.rating, pr.comment FROM product_reviews pr
JOIN users u ON pr.user_id = u.id WHERE pr.shop_id = 1 AND pr.status = 'approved';

-- Check triggers
SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE 
FROM INFORMATION_SCHEMA.TRIGGERS 
WHERE TRIGGER_SCHEMA = DATABASE() 
ORDER BY EVENT_OBJECT_TABLE, TRIGGER_NAME;

-- Quick Shop Stats Verification (after Step 7)
SELECT 'Shop Stats After Fix' AS info, 
       id, name, total_revenue, total_products, pending_orders, completed_orders, average_rating, total_reviews, average_product_rating, total_product_reviews 
FROM shops;

-- Verify new columns in orders table
SELECT 'Orders Table Structure' AS info;
DESCRIBE orders;

-- Verify special_order_requests table
SELECT 'Special Order Requests Table Structure' AS info;
DESCRIBE special_order_requests;

-- Show sample special order requests
SELECT 'Sample Special Order Requests' AS info;
SELECT * FROM special_order_requests LIMIT 5;

-- =====================================================
-- COMMIT AND CLEANUP
-- =====================================================
COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
SET AUTOCOMMIT = 1;
SET SQL_SAFE_UPDATES = 1;  -- FIX: Re-enable safe updates after script

SELECT 'COMPLETE DATABASE SETUP SUCCESSFUL! New admin added with bcrypt hash. Login: newadmin@flowershop.com / admin456' AS final_message;