#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "🚀 Bắt đầu test Review APIs với curl..."
echo "=========================================="

# Test 1: Kiểm tra server
echo -e "\n📡 Test 1: Kiểm tra server"
curl -s "http://localhost:3000" | jq '.'
echo -e "\n---"

# Test 2: Tạo review mới
echo -e "\n📝 Test 2: Tạo review mới"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/reviews" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sản phẩm test tuyệt vời!",
    "description": "Đây là review test để kiểm tra API",
    "rate": 5,
    "verified_purchase": true,
    "would_recommend": true,
    "user": "testuser123"
  }')

echo "$CREATE_RESPONSE" | jq '.'
REVIEW_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')
echo -e "\n📋 Review ID: $REVIEW_ID"
echo -e "\n---"

# Test 3: Tạo thêm reviews để test phân trang
echo -e "\n📝 Test 3: Tạo thêm reviews để test phân trang"
curl -s -X POST "$BASE_URL/reviews" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sản phẩm test thứ 2",
    "description": "Review test thứ 2 để kiểm tra phân trang",
    "rate": 4,
    "verified_purchase": false,
    "would_recommend": true,
    "user": "testuser456"
  }' | jq '.'

curl -s -X POST "$BASE_URL/reviews" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sản phẩm test thứ 3",
    "description": "Review test thứ 3 để kiểm tra tìm kiếm",
    "rate": 3,
    "verified_purchase": true,
    "would_recommend": false,
    "user": "testuser789"
  }' | jq '.'
echo -e "\n---"

# Test 4: Lấy tất cả reviews (không phân trang)
echo -e "\n📋 Test 4: Lấy tất cả reviews (không phân trang)"
curl -s "$BASE_URL/reviews" | jq '.'
echo -e "\n---"

# Test 5: Lấy reviews với phân trang
echo -e "\n📋 Test 5: Lấy reviews với phân trang (pageIndex=0, pageSize=2)"
curl -s "$BASE_URL/reviews?pageIndex=0&pageSize=2" | jq '.'
echo -e "\n---"

# Test 6: Lấy reviews trang thứ 2
echo -e "\n📋 Test 6: Lấy reviews trang thứ 2 (pageIndex=1, pageSize=2)"
curl -s "$BASE_URL/reviews?pageIndex=1&pageSize=2" | jq '.'
echo -e "\n---"

# Test 7: Lấy review theo ID
echo -e "\n📋 Test 7: Lấy review theo ID"
curl -s "$BASE_URL/reviews/$REVIEW_ID" | jq '.'
echo -e "\n---"

# Test 8: Tìm kiếm reviews
echo -e "\n🔍 Test 8: Tìm kiếm reviews với từ khóa 'test'"
curl -s "$BASE_URL/reviews/search?q=test&pageIndex=0&pageSize=5" | jq '.'
echo -e "\n---"

# Test 9: Tìm kiếm theo rating
echo -e "\n🔍 Test 9: Tìm kiếm reviews có rating = 5"
curl -s "$BASE_URL/reviews/search?rate=5&pageIndex=0&pageSize=5" | jq '.'
echo -e "\n---"

# Test 10: Lấy reviews theo user
echo -e "\n👤 Test 10: Lấy reviews của user testuser123"
curl -s "$BASE_URL/reviews/user/testuser123?pageIndex=0&pageSize=5" | jq '.'
echo -e "\n---"

# Test 11: Tăng like cho review
echo -e "\n👍 Test 11: Tăng like cho review"
curl -s -X POST "$BASE_URL/reviews/$REVIEW_ID/like" \
  -H "Content-Type: application/json" \
  -d '{"action": "increment"}' | jq '.'
echo -e "\n---"

# Test 12: Cập nhật review
echo -e "\n✏️ Test 12: Cập nhật review"
curl -s -X PUT "$BASE_URL/reviews/$REVIEW_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sản phẩm test đã được cập nhật!",
    "rate": 4
  }' | jq '.'
echo -e "\n---"

# Test 13: Lấy reviews với filter
echo -e "\n🔍 Test 13: Lấy reviews đã mua và khuyến nghị"
curl -s "$BASE_URL/reviews/search?verified_purchase=true&would_recommend=true&pageIndex=0&pageSize=5" | jq '.'
echo -e "\n---"

# Test 14: Test error case - Tạo review thiếu user
echo -e "\n❌ Test 14: Test error case - Tạo review thiếu user"
curl -s -X POST "$BASE_URL/reviews" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}' | jq '.'
echo -e "\n---"

# Test 15: Test error case - Rate không hợp lệ
echo -e "\n❌ Test 15: Test error case - Rate không hợp lệ"
curl -s -X POST "$BASE_URL/reviews" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "user": "testuser",
    "rate": 6
  }' | jq '.'
echo -e "\n---"

# Test 16: Test error case - pageIndex âm
echo -e "\n❌ Test 16: Test error case - pageIndex âm"
curl -s "$BASE_URL/reviews?pageIndex=-1&pageSize=10" | jq '.'
echo -e "\n---"

# Test 17: Test error case - pageSize quá lớn
echo -e "\n❌ Test 17: Test error case - pageSize quá lớn"
curl -s "$BASE_URL/reviews?pageIndex=0&pageSize=101" | jq '.'
echo -e "\n---"

echo "🎉 Tất cả tests đã hoàn thành!"
echo "=========================================="
