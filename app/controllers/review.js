const connection = require("../common/connect");
const { upload } = require("./media");
const { MediaController } = require("../controllers/media");

class ReviewController {
  async getAllReviews(req, res) {
    try {
      const pageIndex = (parseInt(req.query.pageIndex) || 1) - 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const offset = pageIndex * pageSize;

      if (pageIndex < 0 || pageSize < 1 || pageSize > 100) {
        return res.status(400).json({
          success: false,
          message: "PageIndex phải >= 0, pageSize phải từ 1-100",
        });
      }

      const [countResult] = await connection.promise().query("SELECT COUNT(*) as total FROM reviews");
      const total = countResult[0].total;

      const totalPages = Math.ceil(total / pageSize);

      const [rows] = await connection
        .promise()
        .query("SELECT * FROM reviews ORDER BY CASE WHEN orderSort IS NOT NULL THEN 0 ELSE 1 END, orderSort ASC, created DESC LIMIT ? OFFSET ?", [pageSize, offset]);

      return res.status(200).json({
        success: true,
        data: {
          reviews: rows,
          pagination: {
            pageIndex: pageIndex,
            pageSize: pageSize,
            totalPages: totalPages,
            totalItems: total,
            hasNextPage: pageIndex < totalPages - 1,
            hasPrevPage: pageIndex > 0,
          },
        },
        message: "Lấy danh sách reviews thành công",
      });
    } catch (error) {
      console.error("Error getting reviews:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách reviews",
      });
    }
  }

  async getReviewById(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await connection.promise().query("SELECT * FROM reviews WHERE id = ?", [id]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy review",
        });
      }

      return res.status(200).json({
        success: true,
        data: rows[0],
        message: "Lấy review thành công",
      });
    } catch (error) {
      console.error("Error getting review by id:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy review",
      });
    }
  }

  async createReview(req, res) {
    try {
      const { title, description, rate, verified_purchase, would_recommend, images, videos, user, likes, orderSort, outstanding } = req.body;

      if (!title || !user) {
        return res.status(400).json({
          success: false,
          message: "Title và user là bắt buộc",
        });
      }

      if (rate && (rate < 1 || rate > 5)) {
        return res.status(400).json({
          success: false,
          message: "Rate phải từ 1 đến 5",
        });
      }

      if (orderSort && (orderSort < 0)) {
        return res.status(400).json({
          success: false,
          message: "OrderSort phải >= 0",
        });
      }

      const [result] = await connection.promise().query(
        `INSERT INTO reviews (title, description, rate, verified_purchase, would_recommend, images, videos, user, likes, orderSort, outstanding) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description || null,
          rate || 1,
          verified_purchase || false,
          would_recommend || false,
          images ? JSON.stringify(images) : null,
          videos ? JSON.stringify(videos) : null,
          user,
          Number(likes) || 0,
          orderSort ? Number(orderSort) : null,
          outstanding || false,
        ]
      );

      const [newReview] = await connection.promise().query("SELECT * FROM reviews WHERE id = ?", [result.insertId]);

      return res.status(201).json({
        success: true,
        data: newReview[0],
        message: "Tạo review thành công",
      });
    } catch (error) {
      console.error("Error creating review:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo review",
      });
    }
  }

  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { title, description, rate, verified_purchase, would_recommend, images, videos, likes, orderSort, outstanding } = req.body;

      if (rate && (rate < 1 || rate > 5)) {
        return res.status(400).json({
          success: false,
          message: "Rate phải từ 1 đến 5",
        });
      }

      if (orderSort && (orderSort < 0)) {
        return res.status(400).json({
          success: false,
          message: "OrderSort phải >= 0",
        });
      }

      const [existingReview] = await connection.promise().query("SELECT * FROM reviews WHERE id = ?", [id]);

      if (existingReview.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy review",
        });
      }

      const [result] = await connection.promise().query(
        `UPDATE reviews SET 
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         rate = COALESCE(?, rate),
         likes = COALESCE(?, likes),
         verified_purchase = COALESCE(?, verified_purchase),
         would_recommend = COALESCE(?, would_recommend),
         images = COALESCE(?, images),
         videos = COALESCE(?, videos),
         orderSort = COALESCE(?, orderSort),
         outstanding = COALESCE(?, outstanding)
         WHERE id = ?`,
        [
          title || null,
          description || null,
          rate || 1,
          Number(likes) || 0,
          verified_purchase !== undefined ? verified_purchase : null,
          would_recommend !== undefined ? would_recommend : null,
          images ? JSON.stringify(images) : null,
          videos ? JSON.stringify(videos) : null,
          orderSort ? Number(orderSort) : null,
          outstanding !== undefined ? outstanding : null,
          id,
        ]
      );

      const [updatedReview] = await connection.promise().query("SELECT * FROM reviews WHERE id = ?", [id]);

      return res.status(200).json({
        success: true,
        data: updatedReview[0],
        message: "Cập nhật review thành công",
      });
    } catch (error) {
      console.error("Error updating review:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật review",
      });
    }
  }

  async deleteReview(req, res) {
    try {
      const { id } = req.params;

      const [existingReview] = await connection.promise().query("SELECT * FROM reviews WHERE id = ?", [id]);

      if (existingReview.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy review",
        });
      }

      const { images, videos } = existingReview[0];

      await MediaController.deleteFiles(images, "images");
      await MediaController.deleteFiles(videos, "videos");

      await connection.promise().query("DELETE FROM reviews WHERE id = ?", [id]);

      return res.status(200).json({
        success: true,
        message: "Xóa review thành công",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa review",
      });
    }
  }

  async toggleLike(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body;

      if (!action || !["increment", "decrement"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Action phải là 'increment' hoặc 'decrement'",
        });
      }

      const [existingReview] = await connection.promise().query("SELECT * FROM reviews WHERE id = ?", [id]);

      if (existingReview.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy review",
        });
      }

      const currentLikes = existingReview[0].likes || 0;
      const newLikes = action === "increment" ? currentLikes + 1 : Math.max(0, currentLikes - 1);

      await connection.promise().query("UPDATE reviews SET `likes` = ? WHERE id = ?", [newLikes, id]);

      return res.status(200).json({
        success: true,
        data: { likes: newLikes },
        message: `${action === "increment" ? "Tăng" : "Giảm"} likes thành công`,
      });
    } catch (error) {
      console.error("Error toggling likes:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi thay đổi likes",
      });
    }
  }

  async getReviewsByUser(req, res) {
    try {
      const { user } = req.params;
      const { pageIndex, pageSize } = req.query;

      const currentPageIndex = parseInt(pageIndex) || 0;
      const currentPageSize = parseInt(pageSize) || 10;
      const offset = currentPageIndex * currentPageSize;

      if (currentPageIndex < 0 || currentPageSize < 1 || currentPageSize > 100) {
        return res.status(400).json({
          success: false,
          message: "PageIndex phải >= 0, pageSize phải từ 1-100",
        });
      }

      const [countResult] = await connection
        .promise()
        .query("SELECT COUNT(*) as total FROM reviews WHERE user = ?", [user]);
      const total = countResult[0].total;

      const totalPages = Math.ceil(total / currentPageSize);

      const [rows] = await connection
        .promise()
        .query("SELECT * FROM reviews WHERE user = ? ORDER BY created DESC, orderSort ASC LIMIT ? OFFSET ?", [
          user,
          currentPageSize,
          offset,
        ]);

      return res.status(200).json({
        success: true,
        data: {
          reviews: rows,
          pagination: {
            pageIndex: currentPageIndex,
            pageSize: currentPageSize,
            totalPages: totalPages,
            totalItems: total,
            hasNextPage: currentPageIndex < totalPages - 1,
            hasPrevPage: currentPageIndex > 0,
          },
          user: user,
        },
        message: "Lấy reviews của user thành công",
      });
    } catch (error) {
      console.error("Error getting reviews by user:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy reviews của user",
      });
    }
  }

  async searchReviews(req, res) {
    try {
      const { q, rate, verified_purchase, would_recommend, pageIndex, pageSize } = req.query;

      const currentPageIndex = parseInt(pageIndex) || 0;
      const currentPageSize = parseInt(pageSize) || 10;
      const offset = currentPageIndex * currentPageSize;

      if (currentPageIndex < 0 || currentPageSize < 1 || currentPageSize > 100) {
        return res.status(400).json({
          success: false,
          message: "PageIndex phải >= 0, pageSize phải từ 1-100",
        });
      }

      let whereClause = "WHERE 1=1";
      let params = [];

      if (q) {
        whereClause += " AND (title LIKE ? OR description LIKE ?)";
        params.push(`%${q}%`, `%${q}%`);
      }

      if (rate) {
        whereClause += " AND rate = ?";
        params.push(rate);
      }

      if (verified_purchase !== undefined) {
        whereClause += " AND verified_purchase = ?";
        params.push(verified_purchase === "true");
      }

      if (would_recommend !== undefined) {
        whereClause += " AND would_recommend = ?";
        params.push(would_recommend === "true");
      }

      const countQuery = `SELECT COUNT(*) as total FROM reviews ${whereClause}`;
      const [countResult] = await connection.promise().query(countQuery, params);
      const total = countResult[0].total;

      const totalPages = Math.ceil(total / currentPageSize);

      const searchQuery = `SELECT * FROM reviews ${whereClause} ORDER BY CASE WHEN orderSort IS NOT NULL THEN 0 ELSE 1 END, orderSort ASC, created DESC LIMIT ? OFFSET ?`;
      const searchParams = [...params, currentPageSize, offset];
      const [rows] = await connection.promise().query(searchQuery, searchParams);

      return res.status(200).json({
        success: true,
        data: {
          reviews: rows,
          pagination: {
            pageIndex: currentPageIndex,
            pageSize: currentPageSize,
            totalPages: totalPages,
            totalItems: total,
            hasNextPage: currentPageIndex < totalPages - 1,
            hasPrevPage: currentPageIndex > 0,
          },
          filters: {
            searchQuery: q || null,
            rate: rate || null,
            verified_purchase: verified_purchase !== undefined ? verified_purchase === "true" : null,
            would_recommend: would_recommend !== undefined ? would_recommend === "true" : null,
          },
        },
        message: "Tìm kiếm reviews thành công",
      });
    } catch (error) {
      console.error("Error searching reviews:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi tìm kiếm reviews",
      });
    }
  }
}

module.exports = new ReviewController();
