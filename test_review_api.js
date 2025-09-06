const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testReview = {
  title: "Sản phẩm test tuyệt vời!",
  description: "Đây là review test để kiểm tra API",
  rate: 5,
  verified_purchase: true,
  would_recommend: true,
  user: "testuser123"
};

const testReview2 = {
  title: "Sản phẩm test thứ 2",
  description: "Review test thứ 2 để kiểm tra phân trang",
  rate: 4,
  verified_purchase: false,
  would_recommend: true,
  user: "testuser456"
};

const testReview3 = {
  title: "Sản phẩm test thứ 3",
  description: "Review test thứ 3 để kiểm tra tìm kiếm",
  rate: 3,
  verified_purchase: true,
  would_recommend: false,
  user: "testuser789"
};

async function testReviewAPIs() {
  console.log('🚀 Bắt đầu test Review APIs...\n');

  try {
    // Test 1: Tạo review mới
    console.log('📝 Test 1: Tạo review mới');
    const createResponse = await axios.post(`${BASE_URL}/reviews`, testReview);
    console.log('✅ Tạo review thành công:', createResponse.data.message);
    const reviewId = createResponse.data.data.id;
    console.log('📋 Review ID:', reviewId);
    console.log('---\n');

    // Test 2: Tạo thêm 2 reviews để test phân trang
    console.log('📝 Test 2: Tạo thêm reviews để test phân trang');
    await axios.post(`${BASE_URL}/reviews`, testReview2);
    await axios.post(`${BASE_URL}/reviews`, testReview3);
    console.log('✅ Đã tạo thêm 2 reviews');
    console.log('---\n');

    // Test 3: Lấy tất cả reviews (không phân trang)
    console.log('📋 Test 3: Lấy tất cả reviews (không phân trang)');
    const getAllResponse = await axios.get(`${BASE_URL}/reviews`);
    console.log('✅ Lấy reviews thành công');
    console.log('📊 Tổng số reviews:', getAllResponse.data.data.pagination.totalItems);
    console.log('📄 Số trang:', getAllResponse.data.data.pagination.totalPages);
    console.log('---\n');

    // Test 4: Lấy reviews với phân trang
    console.log('📋 Test 4: Lấy reviews với phân trang');
    const paginatedResponse = await axios.get(`${BASE_URL}/reviews?pageIndex=0&pageSize=2`);
    console.log('✅ Lấy reviews phân trang thành công');
    console.log('📊 Trang hiện tại:', paginatedResponse.data.data.pagination.pageIndex);
    console.log('📄 Kích thước trang:', paginatedResponse.data.data.pagination.pageSize);
    console.log('📋 Số reviews trong trang:', paginatedResponse.data.data.reviews.length);
    console.log('---\n');

    // Test 5: Lấy review theo ID
    console.log('📋 Test 5: Lấy review theo ID');
    const getByIdResponse = await axios.get(`${BASE_URL}/reviews/${reviewId}`);
    console.log('✅ Lấy review theo ID thành công');
    console.log('📋 Title:', getByIdResponse.data.data.title);
    console.log('📋 User:', getByIdResponse.data.data.user);
    console.log('---\n');

    // Test 6: Tìm kiếm reviews
    console.log('🔍 Test 6: Tìm kiếm reviews');
    const searchResponse = await axios.get(`${BASE_URL}/reviews/search?q=test&pageIndex=0&pageSize=5`);
    console.log('✅ Tìm kiếm thành công');
    console.log('📊 Kết quả tìm kiếm:', searchResponse.data.data.pagination.totalItems);
    console.log('📋 Reviews tìm thấy:', searchResponse.data.data.reviews.length);
    console.log('---\n');

    // Test 7: Tìm kiếm theo rating
    console.log('🔍 Test 7: Tìm kiếm theo rating');
    const searchByRateResponse = await axios.get(`${BASE_URL}/reviews/search?rate=5&pageIndex=0&pageSize=5`);
    console.log('✅ Tìm kiếm theo rating thành công');
    console.log('📊 Reviews có rating 5:', searchByRateResponse.data.data.pagination.totalItems);
    console.log('---\n');

    // Test 8: Lấy reviews theo user
    console.log('👤 Test 8: Lấy reviews theo user');
    const userReviewsResponse = await axios.get(`${BASE_URL}/reviews/user/testuser123?pageIndex=0&pageSize=5`);
    console.log('✅ Lấy reviews theo user thành công');
    console.log('📊 Reviews của user testuser123:', userReviewsResponse.data.data.pagination.totalItems);
    console.log('---\n');

    // Test 9: Tăng like cho review
    console.log('👍 Test 9: Tăng like cho review');
    const likeResponse = await axios.post(`${BASE_URL}/reviews/${reviewId}/like`, { action: 'increment' });
    console.log('✅ Tăng like thành công');
    console.log('📊 Số like mới:', likeResponse.data.data.like);
    console.log('---\n');

    // Test 10: Cập nhật review
    console.log('✏️ Test 10: Cập nhật review');
    const updateData = {
      title: "Sản phẩm test đã được cập nhật!",
      rate: 4
    };
    const updateResponse = await axios.put(`${BASE_URL}/reviews/${reviewId}`, updateData);
    console.log('✅ Cập nhật review thành công');
    console.log('📋 Title mới:', updateResponse.data.data.title);
    console.log('📊 Rating mới:', updateResponse.data.data.rate);
    console.log('---\n');

    // Test 11: Lấy reviews với các filter khác nhau
    console.log('🔍 Test 11: Lấy reviews với các filter khác nhau');
    const filterResponse = await axios.get(`${BASE_URL}/reviews/search?verified_purchase=true&would_recommend=true&pageIndex=0&pageSize=5`);
    console.log('✅ Lọc reviews thành công');
    console.log('📊 Reviews đã mua và khuyến nghị:', filterResponse.data.data.pagination.totalItems);
    console.log('---\n');

    // Test 12: Test phân trang với pageIndex khác nhau
    console.log('📄 Test 12: Test phân trang với pageIndex khác nhau');
    const page1Response = await axios.get(`${BASE_URL}/reviews?pageIndex=0&pageSize=2`);
    const page2Response = await axios.get(`${BASE_URL}/reviews?pageIndex=1&pageSize=2`);
    console.log('✅ Phân trang thành công');
    console.log('📄 Trang 1 (pageIndex=0):', page1Response.data.data.reviews.length, 'reviews');
    console.log('📄 Trang 2 (pageIndex=1):', page2Response.data.data.reviews.length, 'reviews');
    console.log('---\n');

    console.log('🎉 Tất cả tests đã hoàn thành thành công!');

  } catch (error) {
    console.error('❌ Lỗi khi test API:', error.response?.data || error.message);
  }
}

// Test error cases
async function testErrorCases() {
  console.log('\n🚨 Bắt đầu test Error Cases...\n');

  try {
    // Test 1: Tạo review thiếu required fields
    console.log('❌ Test 1: Tạo review thiếu required fields');
    try {
      await axios.post(`${BASE_URL}/reviews`, { title: "Test" }); // Thiếu user
    } catch (error) {
      console.log('✅ Xử lý lỗi đúng:', error.response.data.message);
    }
    console.log('---\n');

    // Test 2: Tạo review với rate không hợp lệ
    console.log('❌ Test 2: Tạo review với rate không hợp lệ');
    try {
      await axios.post(`${BASE_URL}/reviews`, { ...testReview, rate: 6 }); // Rate > 5
    } catch (error) {
      console.log('✅ Xử lý lỗi đúng:', error.response.data.message);
    }
    console.log('---\n');

    // Test 3: Lấy review với ID không tồn tại
    console.log('❌ Test 3: Lấy review với ID không tồn tại');
    try {
      await axios.get(`${BASE_URL}/reviews/99999`);
    } catch (error) {
      console.log('✅ Xử lý lỗi đúng:', error.response.data.message);
    }
    console.log('---\n');

    // Test 4: Phân trang với pageIndex âm
    console.log('❌ Test 4: Phân trang với pageIndex âm');
    try {
      await axios.get(`${BASE_URL}/reviews?pageIndex=-1&pageSize=10`);
    } catch (error) {
      console.log('✅ Xử lý lỗi đúng:', error.response.data.message);
    }
    console.log('---\n');

    // Test 5: Phân trang với pageSize quá lớn
    console.log('❌ Test 5: Phân trang với pageSize quá lớn');
    try {
      await axios.get(`${BASE_URL}/reviews?pageIndex=0&pageSize=101`);
    } catch (error) {
      console.log('✅ Xử lý lỗi đúng:', error.response.data.message);
    }
    console.log('---\n');

    console.log('🎉 Tất cả Error Cases tests đã hoàn thành!');

  } catch (error) {
    console.error('❌ Lỗi khi test Error Cases:', error.response?.data || error.message);
  }
}

// Chạy tests
async function runAllTests() {
  await testReviewAPIs();
  await testErrorCases();
}

// Kiểm tra xem server có đang chạy không
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:3000');
    console.log('✅ Server đang chạy:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Server không chạy. Vui lòng khởi động server trước:');
    console.error('   npm start');
    return false;
  }
}

// Main function
async function main() {
  console.log('🔍 Kiểm tra server...');
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    console.log('\n🚀 Bắt đầu chạy tests...\n');
    await runAllTests();
  }
}

// Chạy main function
main().catch(console.error);
