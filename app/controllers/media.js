const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const ffmpeg = require("fluent-ffmpeg");
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

        const extractFrame = true;
        const timestamp = req.body.timestamp || "00:00:01";

        const uploadedFiles = await Promise.all(
          req.files.map(async (file) => {
            const fileType = file.mimetype.startsWith("image/") ? "images" : "videos";
            const fileUrl = `/uploads/${fileType}/${file.filename}`;

            const fileData = {
              filename: file.filename,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              url: fileUrl,
              path: file.path,
            };

            if (fileType === "videos" && extractFrame) {
              try {
                const frameData = await MediaController.extractFrameFromVideo(file.filename, timestamp);
                if (frameData) {
                  fileData.extractedFrame = frameData;
                }
              } catch (frameError) {
                console.error(`Error extracting frame from ${file.filename}:`, frameError);
                fileData.frameExtractionError = frameError.message;
              }
            }

            return fileData;
          })
        );
        const videoFiles = uploadedFiles.filter(file => file.mimetype.startsWith("video/"));
        const extractedFrames = uploadedFiles.filter(file => file.extractedFrame).length;
        let message = `Upload ${uploadedFiles.length} files thành công`;
        if (extractFrame && videoFiles.length > 0) {
          message += ` (${extractedFrames}/${videoFiles.length} video frames extracted)`;
        }

        return res.status(200).json({
          success: true,
          data: uploadedFiles,
          message: message,
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
      console.log('reviews', reviews)
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
            const review = reviews.find((r) => {
              return r.videos.find((v) => v.filename === filename)
            });
            const video = review?.videos ? review.videos.find((v) => v.filename === filename) : null;
            return {
              filename,
              stat,
              filePath,
              frame: video?.frame || "",
              reviewId: review ? review.id : null,
            };
          })
        );

        videoFilesWithStat.sort((a, b) => b.stat.mtime - a.stat.mtime);
        const limitedVideos = videoFilesWithStat.slice(0, 6);

        files.push(
          ...limitedVideos.filter((video) => video?.reviewId).map(({ filename, frame, reviewId }) => ({
            filename,
            reviewId,
            frame
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

  static async extractFrameFromVideo(videoFilename, timestamp = "00:00:01") {
    const videoPath = path.join(__dirname, "../../uploads/videos", videoFilename);
    try {
      await fs.access(videoPath);
    } catch (error) {
      throw new Error("File video không tồn tại");
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const frameFilename = `frame-${uniqueSuffix}.jpg`;
    const framePath = path.join(__dirname, "../../uploads/images", frameFilename);

    const imagesDir = path.join(__dirname, "../../uploads/images");
    await fs.mkdir(imagesDir, { recursive: true });

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .frames(1)
        .output(framePath)
        .on('end', async () => {
          try {
            await fs.access(framePath);
            
            const frameUrl = `/uploads/images/${frameFilename}`;
            
            resolve({
              frameFilename,
              frameUrl,
              framePath,
              videoFilename,
              timestamp,
            });
          } catch (error) {
            reject(new Error("Không thể tạo file frame"));
          }
        })
        .on('error', (err) => {
          console.error("FFmpeg error:", err);
          if (err.message.includes("Cannot find ffmpeg") || err.message.includes("ffmpeg")) {
            reject(new Error("FFmpeg chưa được cài đặt. Vui lòng cài đặt FFmpeg để sử dụng chức năng cắt frame."));
          } else {
            reject(new Error("Lỗi khi cắt frame từ video: " + err.message));
          }
        })
        .run();
    });
  }

  async deleteFiles(files, type) {
    if (!files) return;

    const _files = typeof files === "string" ? JSON.parse(files) : files;

    const tasks = _files.map(async (file) => {
      const filePath = path.join(__dirname, "../../uploads", type, file?.filename);
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
