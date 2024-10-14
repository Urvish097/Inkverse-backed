const {getDashboard, getDashboardChat, AdminblogSerach, AdminUser, AdminUserFind, AdminDeleteUser} = require("../controller/AdminController/AdminDashborad")
const express = require("express")
const router = express.Router()

router.get("/admin/dashboard",getDashboard);

router.get("/admin/chart",getDashboardChat);

router.get("/admin/blog/find",AdminblogSerach);

router.get("/admin/user",AdminUser);

router.get("/admin/user/find",AdminUserFind);

router.delete("/admin/user/delete/:userId",AdminDeleteUser)

module.exports = router;