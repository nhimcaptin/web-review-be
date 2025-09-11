-- Tạo database nếu chưa có
CREATE DATABASE IF NOT EXISTS web_review;
USE web_review;

-- Tạo bảng reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rate INT CHECK (rate BETWEEN 1 AND 5),
    verified_purchase BOOLEAN DEFAULT FALSE,
    would_recommend BOOLEAN DEFAULT FALSE,
    images JSON,
    videos JSON,
    modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `like` INT DEFAULT 0,
    user VARCHAR(255) NOT NULL,
    orderSort INT NULL,
    outstanding BOOLEAN DEFAULT FALSE,
    INDEX idx_user (user),
    INDEX idx_rate (rate),
    INDEX idx_created (created),
    INDEX idx_verified_purchase (verified_purchase),
    INDEX idx_would_recommend (would_recommend),
    INDEX idx_orderSort (orderSort),
    INDEX idx_outstanding (outstanding)
);

-- Thêm một số dữ liệu mẫu
INSERT INTO reviews (title, description, rate, verified_purchase, would_recommend, images, videos, user, orderSort, outstanding) VALUES
('Sản phẩm tuyệt vời!', 'Chất lượng rất tốt, đóng gói cẩn thận. Tôi rất hài lòng với sản phẩm này.', 5, true, true, '["image1.jpg", "image2.jpg"]', '["video1.mp4"]', 'user1', 1, true),
('Chất lượng trung bình', 'Sản phẩm ổn nhưng giá hơi cao so với chất lượng.', 3, true, false, '["image3.jpg"]', NULL, 'user2', 2, false),
('Không như mong đợi', 'Sản phẩm không đúng như mô tả, hơi thất vọng.', 2, false, false, NULL, NULL, 'user3', NULL, false),
('Tuyệt vời!', 'Rất hài lòng với sản phẩm, sẽ mua lại.', 5, true, true, '["image4.jpg", "image5.jpg"]', NULL, 'user4', 3, true),
('Chất lượng tốt', 'Sản phẩm đúng như mô tả, giao hàng nhanh.', 4, true, true, '["image6.jpg"]', '["video2.mp4"]', 'user5', 4, false);
