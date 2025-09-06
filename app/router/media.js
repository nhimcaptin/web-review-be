const express = require("express");
const router = express.Router();
const { MediaController } = require("../controllers/media");

router.get("/files", MediaController.getFiles);

router.post("/upload/single", MediaController.uploadSingle);

router.post("/upload/multiple", MediaController.uploadMultiple);

router.delete("/files/:filename", MediaController.deleteFile);

module.exports = router;
