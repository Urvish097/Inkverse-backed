const { getDashboard, getDashboardChat, AdminblogSerach, AdminUser, AdminUserFind, AdminDeleteUser, AdminStatusFilter } = require("../controller/AdminController/AdminDashborad")
const express = require("express");
const { UserStatus } = require("../controller/AdminController/UserManegment");
const { AdminSignUp, AdminLogin } = require("../controller/AdminController/AdminAuth");
const { AdminAuth } = require("../middleware/auth");
const { postdelete, getupdateblogs } = require("../controller/BlogController/BlogController");
const { AdmingetAllads, getEarningDashboardChat, enableForPayment, statusActive } = require("../controller/AdminController/Advertisement");
const router = express.Router()

router.get("/admin/dashboard", AdminAuth, getDashboard);

router.get("/admin/chart", AdminAuth, getDashboardChat);

router.get("/admin/Earningchart", AdminAuth, getEarningDashboardChat);

router.get("/admin/blog/find", AdminAuth, AdminblogSerach);

router.get("/admin/user", AdminAuth, AdminUser);

router.get("/admin/user/find", AdminAuth, AdminUserFind);

router.get("/admin/view/blogs/post/:blogId", AdminAuth, getupdateblogs);

router.delete("/admin/user/delete/:userId", AdminAuth, AdminDeleteUser);

router.delete("/admin/postdelete/:blogId", AdminAuth, postdelete);

router.put("/admin/user/status", AdminAuth, UserStatus);

router.get("/admin/statusfilter", AdminAuth, AdminStatusFilter);

router.get("/admin/allAds", AdminAuth, AdmingetAllads);

router.post("/admin/sigup", AdminSignUp);

router.post("/admin/login", AdminLogin);

router.put("/admin/enableForPayment/:adId", enableForPayment);

router.put("/admin/statusActive/:adId", statusActive);

module.exports = router;