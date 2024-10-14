const { getDashboard, getDashboardChat, AdminblogSerach, AdminUser, AdminUserFind, AdminDeleteUser } = require("../controller/AdminController/AdminDashborad")
const express = require("express");
const { UserStatus } = require("../controller/AdminController/UserManegment");
const { AdminSignUp, AdminLogin } = require("../controller/AdminController/AdminAuth");
const { AdminAuth } = require("../middleware/auth")
const router = express.Router()

router.get("/admin/dashboard", getDashboard);

router.get("/admin/chart", getDashboardChat);

router.get("/admin/blog/find", AdminblogSerach);

router.get("/admin/user", AdminUser);

router.get("/admin/user/find", AdminUserFind);

router.delete("/admin/user/delete/:userId", AdminDeleteUser);

router.put("/admin/user/status", UserStatus);

router.post("/admin/sigup", AdminSignUp);

router.post("/admin/login", AdminLogin)

module.exports = router;