const express = require("express");
const { postAd, getAd } = require("../controller/AdController/Advertisement");
const { uploadMulter } = require("../middleware/multerFileStorgae");
const { authntication } = require("../middleware/auth");
const router = express.Router()

router.post("/user/ad", authntication, uploadMulter.single("poster"), postAd);

router.get("/user/allad/:userId", authntication, getAd);

module.exports = router;