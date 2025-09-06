# PowerShell script để test Review APIs
$BASE_URL = "http://localhost:3000/api"

Write-Host "🚀 Bắt đầu test Review APIs với PowerShell..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Test 1: Kiểm tra server
Write-Host "`n📡 Test 1: Kiểm tra server" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000" -Method Get
    Write-Host "✅ Server đang chạy: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Server không chạy. Vui lòng khởi động server trước: npm start" -ForegroundColor Red
    exit
}
Write-Host "---" -ForegroundColor Gray

# Test 2: Tạo review mới
Write-Host "`n📝 Test 2: Tạo review mới" -ForegroundColor Yellow
$reviewData = @{
    title = "Sản phẩm test tuyệt vời!"
    description = "Đây là review test để kiểm tra API"
    rate = 5
    verified_purchase = $true
    would_recommend = $true
    user = "testuser123"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "$BASE_URL/reviews" -Method Post -Body $reviewData -ContentType "application/json"
    Write-Host "✅ Tạo review thành công: $($createResponse.message)" -ForegroundColor Green
    $reviewId = $createResponse.data.id
    Write-Host "📋 Review ID: $reviewId" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Lỗi khi tạo review: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "---" -ForegroundColor Gray

# Test 3: Tạo thêm reviews để test phân trang
Write-Host "`n📝 Test 3: Tạo thêm reviews để test phân trang" -ForegroundColor Yellow
$reviewData2 = @{
    title = "Sản phẩm test thứ 2"
    description = "Review test thứ 2 để kiểm tra phân trang"
    rate = 4
    verified_purchase = $false
    would_recommend = $true
    user = "testuser456"
} | ConvertTo-Json

$reviewData3 = @{
    title = "Sản phẩm test thứ 3"
    description = "Review test thứ 3 để kiểm tra tìm kiếm"
    rate = 3
    verified_purchase = $true
    would_recommend = $false
    user = "testuser789"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$BASE_URL/reviews" -Method Post -Body $reviewData2 -ContentType "application/json" | Out-Null
    Invoke-RestMethod -Uri "$BASE_URL/reviews" -Method Post -Body $reviewData3 -ContentType "application/json" | Out-Null
    Write-Host "✅ Đã tạo thêm 2 reviews" -ForegroundColor Green
} catch {
    Write-Host "❌ Lỗi khi tạo reviews: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "---" -ForegroundColor Gray

# Test 4: Lấy tất cả reviews (không phân trang)
Write-Host "`n📋 Test 4: Lấy tất cả reviews (không phân trang)" -ForegroundColor Yellow
try {
    $allReviews = Invoke-RestMethod -Uri "$BASE_URL/reviews" -Method Get
    Write-Host "✅ Lấy reviews thành công" -ForegroundColor Green
    Write-Host "📊 Tổng số reviews: $($allReviews.data.pagination.totalItems)" -ForegroundColor Cyan
    Write-Host "📄 Số trang: $($allReviews.data.pagination.totalPages)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Lỗi khi lấy reviews: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "---" -ForegroundColor Gray

# Test 5: Lấy reviews với phân trang
Write-Host "`n📋 Test 5: Lấy reviews với phân trang (pageIndex=0, pageSize=2)" -ForegroundColor Yellow
try {
    $paginatedReviews = Invoke-RestMethod -Uri "$BASE_URL/reviews?pageIndex=0&pageSize=2" -Method Get
    Write-Host "✅ Lấy reviews phân trang thành công" -ForegroundColor Green
    Write-Host "📊 Trang hiện tại: $($paginatedReviews.data.pagination.pageIndex)" -ForegroundColor Cyan
    Write-Host "📄 Kích thước trang: $($paginatedReviews.data.pagination.pageSize)" -ForegroundColor Cyan
    Write-Host "📋 Số reviews trong trang: $($paginatedReviews.data.reviews.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Lỗi khi lấy reviews phân trang: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "---" -ForegroundColor Gray

# Test 6: Lấy review theo ID
Write-Host "`n📋 Test 6: Lấy review theo ID" -ForegroundColor Yellow
try {
    $reviewById = Invoke-RestMethod -Uri "$BASE_URL/reviews/$reviewId" -Method Get
    Write-Host "✅ Lấy review theo ID thành công" -ForegroundColor Green
    Write-Host "📋 Title: $($reviewById.data.title)" -ForegroundColor Cyan
    Write-Host "📋 User: $($reviewById.data.user)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Lỗi khi lấy review theo ID: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "---" -ForegroundColor Gray

# Test 7: Tìm kiếm reviews
Write-Host "`n🔍 Test 7: Tìm kiếm reviews với từ khóa 'test'" -ForegroundColor Yellow
try {
    $searchResults = Invoke-RestMethod -Uri "$BASE_URL/reviews/search?q=test&pageIndex=0&pageSize=5" -Method Get
    Write-Host "✅ Tìm kiếm thành công" -ForegroundColor Green
    Write-Host "📊 Kết quả tìm kiếm: $($searchResults.data.pagination.totalItems)" -ForegroundColor Cyan
    Write-Host "📋 Reviews tìm thấy: $($searchResults.data.reviews.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Lỗi khi tìm kiếm: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "---" -ForegroundColor Gray

# Test 8: Tìm kiếm theo rating
Write-Host "`n🔍 Test 8: Tìm kiếm reviews có rating = 5" -ForegroundColor Yellow
try {
    $searchByRate = Invoke-RestMethod -Uri "$BASE_URL/reviews/search?rate=5&pageIndex=0&pageSize=5" -Method Get
    Write-Host "✅ Tìm kiếm theo rating thành công" -ForegroundColor Green
    Write-Host "📊 Reviews có rating 5: $($searchByRate.data.pagination.totalItems)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Lỗi khi tìm kiếm theo rating: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "---" -ForegroundColor Gray

# Test 9: Lấy reviews theo user
Write-Host "`n👤 Test 9: Lấy reviews của user testuser123" -ForegroundColor Yellow
try {
    $userReviews = Invoke-RestMethod -Uri "$BASE_URL/reviews/user/testuser123?pageIndex=0&pageSize=5" -Method Get
    Write-Host "✅ Lấy reviews theo user thành công" -ForegroundColor Green
    Write-Host "📊 Reviews của user testuser123: $($userReviews.data.pagination.totalItems)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Lỗi khi lấy reviews theo user: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "---" -ForegroundColor Gray

# Test 10: Tăng like cho review
Write-Host "`n👍 Test 10: Tăng like cho review" -ForegroundColor Yellow
$likeData = @{
    action = "increment"
} | ConvertTo-Json

try {
    $likeResponse = Invoke-RestMethod -Uri "$BASE_URL/reviews/$reviewId/like" -Method Post -Body $likeData -ContentType "application/json"
    Write-Host "✅ Tăng like thành công" -ForegroundColor Green
    Write-Host "📊 Số like mới: $($likeResponse.data.like)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Lỗi khi tăng like: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "---" -ForegroundColor Gray

# Test 11: Cập nhật review
Write-Host "`n✏️ Test 11: Cập nhật review" -ForegroundColor Yellow
$updateData = @{
    title = "Sản phẩm test đã được cập nhật!"
    rate = 4
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$BASE_URL/reviews/$reviewId" -Method Put -Body $updateData -ContentType "application/json"
    Write-Host "✅ Cập nhật review thành công" -ForegroundColor Green
    Write-Host "📋 Title mới: $($updateResponse.data.title)" -ForegroundColor Cyan
    Write-Host "📊 Rating mới: $($updateResponse.data.rate)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Lỗi khi cập nhật review: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "---" -ForegroundColor Gray

# Test 12: Lấy reviews với filter
Write-Host "`n🔍 Test 12: Lấy reviews đã mua và khuyến nghị" -ForegroundColor Yellow
try {
    $filteredReviews = Invoke-RestMethod -Uri "$BASE_URL/reviews/search?verified_purchase=true&would_recommend=true&pageIndex=0&pageSize=5" -Method Get
    Write-Host "✅ Lọc reviews thành công" -ForegroundColor Green
    Write-Host "📊 Reviews đã mua và khuyến nghị: $($filteredReviews.data.pagination.totalItems)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Lỗi khi lọc reviews: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "---" -ForegroundColor Gray

# Test 13: Test error case - Tạo review thiếu user
Write-Host "`n❌ Test 13: Test error case - Tạo review thiếu user" -ForegroundColor Yellow
$invalidData = @{
    title = "Test"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$BASE_URL/reviews" -Method Post -Body $invalidData -ContentType "application/json" | Out-Null
} catch {
    Write-Host "✅ Xử lý lỗi đúng: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host "---" -ForegroundColor Gray

# Test 14: Test error case - Rate không hợp lệ
Write-Host "`n❌ Test 14: Test error case - Rate không hợp lệ" -ForegroundColor Yellow
$invalidRateData = @{
    title = "Test"
    user = "testuser"
    rate = 6
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$BASE_URL/reviews" -Method Post -Body $invalidRateData -ContentType "application/json" | Out-Null
} catch {
    Write-Host "✅ Xử lý lỗi đúng: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host "---" -ForegroundColor Gray

# Test 15: Test error case - pageIndex âm
Write-Host "`n❌ Test 15: Test error case - pageIndex âm" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE_URL/reviews?pageIndex=-1&pageSize=10" -Method Get | Out-Null
} catch {
    Write-Host "✅ Xử lý lỗi đúng: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host "---" -ForegroundColor Gray

# Test 16: Test error case - pageSize quá lớn
Write-Host "`n❌ Test 16: Test error case - pageSize quá lớn" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE_URL/reviews?pageIndex=0&pageSize=101" -Method Get | Out-Null
} catch {
    Write-Host "✅ Xử lý lỗi đúng: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Message)" -ForegroundColor Green
}
Write-Host "---" -ForegroundColor Gray

Write-Host "`n🎉 Tất cả tests đã hoàn thành!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
