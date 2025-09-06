const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const connection = require("../common/connect");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = file.mimetype.startsWith("image/") ? "images" : "videos";
    const uploadPath = path.join(__dirname, "../../uploads", fileType);

    fs.mkdir(uploadPath, { recursive: true })
      .then(() => {
        cb(null, uploadPath);
      })
      .catch((err) => {
        cb(err);
      });
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload image và video!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

class MediaController {
  async uploadSingle(req, res) {
    try {
      const uploadSingle = upload.single("file");

      uploadSingle(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "Vui lòng chọn file để upload",
          });
        }

        const fileType = req.file.mimetype.startsWith("image/") ? "images" : "videos";
        const fileUrl = `/uploads/${fileType}/${req.file.filename}`;

        return res.status(200).json({
          success: true,
          data: {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: fileUrl,
            path: req.file.path,
          },
          message: "Upload file thành công",
        });
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi upload file",
      });
    }
  }

  async uploadMultiple(req, res) {
    try {
      const uploadMultiple = upload.array("files", 10);
      uploadMultiple(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }

        if (!req.files || req.files.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Vui lòng chọn files để upload",
          });
        }

        const uploadedFiles = req.files.map((file) => {
          const fileType = file.mimetype.startsWith("image/") ? "images" : "videos";
          const fileUrl = `/uploads/${fileType}/${file.filename}`;

          return {
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: fileUrl,
            path: file.path,
          };
        });

        return res.status(200).json({
          success: true,
          data: uploadedFiles,
          message: `Upload ${uploadedFiles.length} files thành công`,
        });
      });
    } catch (error) {
      console.error("Error uploading multiple files:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi upload files",
      });
    }
  }

  async deleteFile(req, res) {
    try {
      const { filename } = req.params;
      const { type } = req.query;

      if (!type || !["images", "videos"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type phải là "images" hoặc "videos"',
        });
      }

      const filePath = path.join(__dirname, "../../uploads", type, filename);

      try {
        await fs.access(filePath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: "File không tồn tại",
        });
      }

      await fs.unlink(filePath);

      return res.status(200).json({
        success: true,
        message: "Xóa file thành công",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa file",
      });
    }
  }

  async getFiles(req, res) {
    try {
      const { type } = req.query;
      const [reviews] = await connection.promise().query("SELECT id, images, videos FROM reviews");
      let files = [];
      if (!type || type === "images") {
        const imagesPath = path.join(__dirname, "../../uploads/images");
        const imageFiles = await fs.readdir(imagesPath);

        const imageFilesWithStat = await Promise.all(
          imageFiles.map(async (filename) => {
            const filePath = path.join(imagesPath, filename);
            const stat = await fs.stat(filePath);
            const review = reviews.find((r) => r.images?.includes(filename));
            return {
              filename,
              stat,
              filePath,
              reviewId: review ? review.id : null,
            };
          })
        );
        imageFilesWithStat.sort((a, b) => b.stat.mtime - a.stat.mtime);
        const limitedImages = imageFilesWithStat.slice(0, 10);

        files.push(
          ...limitedImages.map(({ filename, filePath, reviewId }) => ({
            filename,
            reviewId,
          }))
        );
      }

      if (!type || type === "videos") {
        const videosPath = path.join(__dirname, "../../uploads/videos");
        const videoFiles = await fs.readdir(videosPath);

        const videoFilesWithStat = await Promise.all(
          videoFiles.map(async (filename) => {
            const filePath = path.join(videosPath, filename);
            const stat = await fs.stat(filePath);
            const review = reviews.find((r) => r.videos?.includes(filename));
            return {
              filename,
              stat,
              filePath,
              reviewId: review ? review.id : null,
            };
          })
        );

        videoFilesWithStat.sort((a, b) => b.stat.mtime - a.stat.mtime);
        const limitedVideos = videoFilesWithStat.slice(0, 6);

        files.push(
          ...limitedVideos.map(({ filename, filePath, reviewId }) => ({
            filename,
            reviewId,
          }))
        );
      }

      return res.status(200).json({
        success: true,
        data: files,
        message: "Lấy danh sách files thành công",
      });
    } catch (error) {
      console.error("Error getting files:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách files",
      });
    }
  }

  async deleteFiles(files, type) {
    if (!files) return;

    const _files = typeof files === "string" ? JSON.parse(files) : files;

    const tasks = _files.map(async (file) => {
      const filePath = path.join(__dirname, "../../uploads", type, file);
      try {
        await fs.rm(filePath, { force: true });
      } catch (err) {
        console.warn(`Không thể xoá ${type}:`, file, err.message);
      }
    });

    await Promise.all(tasks);
  }
}

module.exports = { MediaController: new MediaController(), upload };
