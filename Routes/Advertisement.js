const express = require("express");
const { postAd, getAd, getadHome, adsfilter } = require("../controller/AdController/Advertisement");
const { uploadMulter } = require("../middleware/multerFileStorgae");
const { authntication } = require("../middleware/auth");
const { getpayment, postverfying } = require("../controller/Payments/payment");
const router = express.Router()

router.post("/user/ad", authntication, uploadMulter.single("poster"), postAd);

router.get("/user/allad/:userId", authntication, getAd);

router.get("/user/payment/:adId", getpayment);

router.get("/user/payment/verfy/:order_id/:adId", postverfying);

router.get("/user/showAd", getadHome)

router.get("/user/adFilter", adsfilter)

module.exports = router;