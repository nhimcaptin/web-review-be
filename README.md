# Review Web API

API CRUD cho hệ thống review sản phẩm.

## Cài đặt

1. Clone repository
2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo database và bảng:
```bash
mysql -u root -p < database.sql
```

4. Khởi động server:
```bash
npm start
```

Server sẽ chạy tại `http://localhost:3000`

## API Endpoints

### Reviews

#### Lấy tất cả reviews
```
GET /api/reviews
GET /api/reviews?pageIndex=0&pageSize=10
```

#### Lấy review theo ID
```
GET /api/reviews/:id
```

#### Tạo review mới
```
POST /api/reviews
Content-Type: application/json

{
  "title": "Tiêu đề review",
  "description": "Mô tả chi tiết",
  "rate": 5,
  "verified_purchase": true,
  "would_recommend": true,
  "images": ["image1.jpg", "image2.jpg"],
  "videos": ["video1.mp4"],
  "user": "username"
}
```

#### Cập nhật review
```
PUT /api/reviews/:id
Content-Type: application/json

{
  "title": "Tiêu đề mới",
  "rate": 4,
  "would_recommend": false
}
```

#### Xóa review
```
DELETE /api/reviews/:id
```

#### Tăng/giảm like
```
POST /api/reviews/:id/like
Content-Type: application/json

{
  "action": "increment"  // hoặc "decrement"
}
```

#### Lấy reviews theo user
```
GET /api/reviews/user/:username
GET /api/reviews/user/:username?pageIndex=0&pageSize=10
```

#### Tìm kiếm reviews
```
GET /api/reviews/search?q=từ khóa&rate=5&verified_purchase=true&would_recommend=true
GET /api/reviews/search?q=từ khóa&pageIndex=0&pageSize=10
```

Query parameters:
- `q`: Tìm kiếm theo title hoặc description
- `rate`: Lọc theo rating (1-5)
- `verified_purchase`: Lọc theo verified purchase (true/false)
- `would_recommend`: Lọc theo would recommend (true/false)
- `pageIndex`: Số trang (bắt đầu từ 0, mặc định: 0)
- `pageSize`: Số item trên mỗi trang (1-100, mặc định: 10)

#### Tạo review với media upload
```
POST /api/reviews/with-media
Content-Type: multipart/form-data

Form fields:
- title: Tiêu đề review
- description: Mô tả chi tiết
- rate: Đánh giá (1-5)
- verified_purchase: true/false
- would_recommend: true/false
- user: Tên người dùng
- images: File ảnh (tối đa 5 files)
- videos: File video (tối đa 3 files)
```

### Media Management

#### Upload single file
```
POST /api/media/upload/single
Content-Type: multipart/form-data

Form field: file
```

#### Upload multiple files
```
POST /api/media/upload/multiple
Content-Type: multipart/form-data

Form field: files (tối đa 10 files)
```

#### Lấy danh sách files
```
GET /api/media/files?type=images
GET /api/media/files?type=videos
GET /api/media/files
```

#### Lấy thông tin file
```
GET /api/media/files/:filename?type=images
GET /api/media/files/:filename?type=videos
```

#### Xóa file
```
DELETE /api/media/files/:filename?type=images
DELETE /api/media/files/:filename?type=videos
```

## Cấu trúc Database

Bảng `reviews`:
- `id`: ID tự động tăng
- `title`: Tiêu đề review (bắt buộc)
- `description`: Mô tả chi tiết
- `rate`: Đánh giá từ 1-5
- `verified_purchase`: Đã mua hàng xác thực
- `would_recommend`: Có khuyến nghị mua không
- `images`: Danh sách ảnh (JSON)
- `videos`: Danh sách video (JSON)
- `modified`: Thời gian cập nhật cuối
- `created`: Thời gian tạo
- `like`: Số lượt thích
- `user`: Tên người dùng (bắt buộc)

## Response Format

Tất cả API đều trả về response với format:

```json
{
  "success": true/false,
  "data": {...},  // Dữ liệu (nếu có)
  "message": "Thông báo"
}
```

### Response với phân trang:

```json
{
  "success": true,
  "data": {
    "reviews": [...],  // Danh sách reviews
    "pagination": {
      "pageIndex": 0,        // Trang hiện tại (bắt đầu từ 0)
      "pageSize": 10,        // Số item trên mỗi trang
      "totalPages": 5,       // Tổng số trang
      "totalItems": 48,      // Tổng số item
      "hasNextPage": true,   // Có trang tiếp theo không
      "hasPrevPage": false   // Có trang trước không
    }
  },
  "message": "Lấy danh sách reviews thành công"
}
```

## Error Handling

- `400`: Bad Request - Dữ liệu không hợp lệ
- `404`: Not Found - Không tìm thấy resource
- `500`: Internal Server Error - Lỗi server

## Ví dụ sử dụng

### Tạo review mới
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sản phẩm tuyệt vời!",
    "description": "Chất lượng rất tốt",
    "rate": 5,
    "verified_purchase": true,
    "would_recommend": true,
    "user": "john_doe"
  }'
```

### Lấy tất cả reviews
```bash
# Lấy trang đầu tiên với 10 items
curl http://localhost:3000/api/reviews

# Lấy trang thứ 2 với 20 items
curl "http://localhost:3000/api/reviews?pageIndex=1&pageSize=20"

# Lấy trang thứ 3 với 5 items
curl "http://localhost:3000/api/reviews?pageIndex=2&pageSize=5"
```

### Tìm kiếm reviews
```bash
# Tìm kiếm cơ bản
curl "http://localhost:3000/api/reviews/search?q=tuyệt&rate=5&verified_purchase=true"

# Tìm kiếm với phân trang
curl "http://localhost:3000/api/reviews/search?q=tuyệt&pageIndex=0&pageSize=5"

# Lấy trang tiếp theo
curl "http://localhost:3000/api/reviews/search?q=tuyệt&pageIndex=1&pageSize=5"
```

### Upload file
```bash
# Upload single file
curl -X POST http://localhost:3000/api/media/upload/single \
  -F "file=@/path/to/image.jpg"

# Upload multiple files
curl -X POST http://localhost:3000/api/media/upload/multiple \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg"

# Tạo review với media
curl -X POST http://localhost:3000/api/reviews/with-media \
  -F "title=Sản phẩm tuyệt vời!" \
  -F "description=Chất lượng rất tốt" \
  -F "rate=5" \
  -F "user=john_doe" \
  -F "images=@/path/to/image.jpg" \
  -F "videos=@/path/to/video.mp4"
```

### Xóa file
```bash
curl -X DELETE "http://localhost:3000/api/media/files/image.jpg?type=images"
curl -X DELETE "http://localhost:3000/api/media/files/video.mp4?type=videos"
```
