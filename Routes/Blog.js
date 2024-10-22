const { postblog, getPostBlogs,LikeCount, getAlluserpost, postdelete, updateBlog, getupdateblogs, homePageCategory, blogSerach,LikeandUnlike } = require("../controller/BlogController/BlogController");
const express = require("express");
const { authntication } = require("../middleware/auth");
const { uploadMulter } = require("../middleware/multerFileStorgae");
const router = express.Router();

router.post("/blog/blog-data", authntication, uploadMulter.fields([{ name: "blogimg", maxCount: 1 }, { name: "additionalimg", maxCount: 10 }]), postblog);

router.get("/user/userpost/:userId", authntication, getPostBlogs);

router.get("/user/alluserpost", getAlluserpost);

router.delete("/user/deletepost/:blogId", authntication, postdelete);

router.put("/user/updatepost/:blogId/:userId", authntication, uploadMulter.fields([{ name: 'blogimg', maxCount: 1 }, { name: 'additionalimg', maxCount: 10 }]), updateBlog)

router.get("/user/update/blogsdata/:blogId", authntication, getupdateblogs)

router.get("/user/view/blogs/post/:blogId", authntication, getupdateblogs)

router.get("/user/category/blog", homePageCategory);

router.get("/user/find/blog", blogSerach)

router.post('/user/blog/like/unlike/:blogId/:userId',authntication,LikeandUnlike)

router.get('/user/blog/likeCounts/:blogId',LikeCount)



module.exports = router;

