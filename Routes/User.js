const { postUsersignUp, postlogin } = require("../controller/UserController/UserAuth");
const { postotp, verifyotp, updatepass, deleteotp } = require("../controller/PassController/PassController")
const express = require("express");
const router = express.Router();
const { uploadMulter } = require("../middleware/multerFileStorgae");

router.post("/user/user-signup", uploadMulter.single("profile"), postUsersignUp);

router.post("/user/user-login", postlogin);

router.post("/user/resetpass/emailcheck", postotp);

router.post("/user/verifyotp", verifyotp);

router.put("/user/updatepassword/:userId", updatepass)

router.delete("/user/delete-otp/:userId", deleteotp)

module.exports = router;