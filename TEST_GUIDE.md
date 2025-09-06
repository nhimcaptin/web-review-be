# 🧪 Hướng dẫn Test Review APIs

## 📋 Yêu cầu trước khi test

1. **Khởi động server:**
   ```bash
   npm start
   ```

2. **Kiểm tra database:**
   - Đảm bảo MySQL đang chạy
   - Database `web_review` đã được tạo
   - Bảng `reviews` đã được tạo từ file `database.sql`

3. **Cài đặt dependencies (nếu chưa có):**
   ```bash
   npm install axios
   ```

## 🚀 Cách test

### **Phương pháp 1: Sử dụng Node.js script**

```bash
# Chạy test script
node test_review_api.js
```

### **Phương pháp 2: Sử dụng PowerShell (Windows)**

```powershell
# Chạy PowerShell script
.\test_review_powershell.ps1
```

### **Phương pháp 3: Sử dụng curl (Linux/Mac)**

```bash
# Cấp quyền thực thi
chmod +x test_review_curl.sh

# Chạy bash script
./test_review_curl.sh
```

### **Phương pháp 4: Test thủ công từng API**

## 📝 Test từng API thủ công

### **1. Kiểm tra server**
```bash
curl http://localhost:3000
```

### **2. Tạo review mới**
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sản phẩm test tuyệt vời!",
    "description": "Đây là review test để kiểm tra API",
    "rate": 5,
    "verified_purchase": true,
    "would_recommend": true,
    "user": "testuser123"
  }'
```

### **3. Lấy tất cả reviews (không phân trang)**
```bash
curl http://localhost:3000/api/reviews
```

### **4. Lấy reviews với phân trang**
```bash
# Trang đầu tiên, 2 items
curl "http://localhost:3000/api/reviews?pageIndex=0&pageSize=2"

# Trang thứ 2, 2 items
curl "http://localhost:3000/api/reviews?pageIndex=1&pageSize=2"
```

### **5. Lấy review theo ID**
```bash
# Thay {id} bằng ID thực tế từ bước 2
curl http://localhost:3000/api/reviews/{id}
```

### **6. Tìm kiếm reviews**
```bash
# Tìm kiếm theo từ khóa
curl "http://localhost:3000/api/reviews/search?q=test&pageIndex=0&pageSize=5"

# Tìm kiếm theo rating
curl "http://localhost:3000/api/reviews/search?rate=5&pageIndex=0&pageSize=5"

# Tìm kiếm theo filter
curl "http://localhost:3000/api/reviews/search?verified_purchase=true&would_recommend=true&pageIndex=0&pageSize=5"
```

### **7. Lấy reviews theo user**
```bash
curl "http://localhost:3000/api/reviews/user/testuser123?pageIndex=0&pageSize=5"
```

### **8. Tăng like cho review**
```bash
curl -X POST http://localhost:3000/api/reviews/{id}/like \
  -H "Content-Type: application/json" \
  -d '{"action": "increment"}'
```

### **9. Cập nhật review**
```bash
curl -X PUT http://localhost:3000/api/reviews/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sản phẩm test đã được cập nhật!",
    "rate": 4
  }'
```

### **10. Test error cases**
```bash
# Tạo review thiếu user
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}'

# Tạo review với rate không hợp lệ
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "user": "testuser", "rate": 6}'

# Phân trang với pageIndex âm
curl "http://localhost:3000/api/reviews?pageIndex=-1&pageSize=10"

# Phân trang với pageSize quá lớn
curl "http://localhost:3000/api/reviews?pageIndex=0&pageSize=101"
```

## 🔍 Kiểm tra kết quả

### **Response thành công:**
```json
{
  "success": true,
  "data": {
    "reviews": [...],
    "pagination": {
      "pageIndex": 0,
      "pageSize": 10,
      "totalPages": 2,
      "totalItems": 15,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Lấy danh sách reviews thành công"
}
```

### **Response lỗi:**
```json
{
  "success": false,
  "message": "PageIndex phải >= 0, pageSize phải từ 1-100"
}
```

## 📊 Các test case chính

1. **✅ CRUD Operations:**
   - Tạo review
   - Lấy review theo ID
   - Cập nhật review
   - Xóa review

2. **✅ Phân trang:**
   - Lấy reviews với pageIndex và pageSize
   - Kiểm tra pagination info
   - Test các trang khác nhau

3. **✅ Tìm kiếm và lọc:**
   - Tìm kiếm theo từ khóa
   - Lọc theo rating
   - Lọc theo verified_purchase
   - Lọc theo would_recommend

4. **✅ Tính năng đặc biệt:**
   - Tăng/giảm like
   - Lấy reviews theo user

5. **✅ Error handling:**
   - Validation errors
   - Not found errors
   - Invalid parameters

## 🚨 Troubleshooting

### **Server không chạy:**
```bash
# Kiểm tra port 3000
netstat -an | findstr :3000  # Windows
netstat -an | grep :3000     # Linux/Mac

# Khởi động server
npm start
```

### **Database connection error:**
- Kiểm tra MySQL service
- Kiểm tra thông tin connection trong `app/common/connect.js`
- Chạy file `database.sql` để tạo database

### **API trả về lỗi:**
- Kiểm tra console log của server
- Kiểm tra request format
- Kiểm tra database schema

## 🎯 Kết quả mong đợi

Sau khi chạy test, bạn sẽ thấy:
- ✅ Tất cả API hoạt động bình thường
- ✅ Phân trang hoạt động chính xác
- ✅ Validation errors được xử lý đúng
- ✅ Response format nhất quán
- ✅ Database được cập nhật chính xác

## 📝 Ghi chú

- Test script sẽ tạo dữ liệu test trong database
- Có thể xóa dữ liệu test sau khi hoàn thành
- Kiểm tra console log để debug nếu có lỗi
- Đảm bảo server đang chạy trước khi test
