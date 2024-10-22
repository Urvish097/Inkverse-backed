const Blog = require("../../Model/Blogs/Blogs");
const User = require("../../Model/User/User")
const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const FilestorageFirebase = require("../../middleware/multerFileStorgae");

exports.postblog = async (req, res, next) => {

    try {

        const { name, title, category, date, maindescription, adddescription1, adddescription2 } = req.body;
        const userType = "userpost"
        const fileType = "bloimages"
        const userId = req.id
        const blogimg = req.files.blogimg ? req.files.blogimg[0] : null; // Main image (only 1 file)
        const additionalimg = req.files.additionalimg || []; // Additional images (array)

        if (!blogimg || additionalimg.length === 0) {
            return next(new ErrorHandler("Select files", StatusCodes.BAD_REQUEST));
        }

        if (!name || !title || !category || !date || !maindescription || !adddescription1 || !adddescription2) {
            return next(new ErrorHandler("All fields are required", StatusCodes.BAD_REQUEST));
        }

        const blog_img = await FilestorageFirebase.uploadToFierbase(blogimg, userId, userType, fileType);

        const additional_images = await Promise.all(
            additionalimg.map(image => FilestorageFirebase.uploadToFierbase(image, userId, userType, fileType))
        );

        const blogdata = await Blog.create({
            name,
            title,
            category,
            date,
            maindescription,
            adddescription1,
            adddescription2,
            blogimg: blog_img,
            additionalimg: additional_images,
            userId: userId
        });

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Blog Created",
            data: blogdata
        });

    } catch (error) {
        return next(new ErrorHandler(error.message || 'Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

exports.getPostBlogs = async (req, res, next) => {
    try {
        const { userId } = req.params
        const uId = req.id

        if (userId != uId) {
            return next(new ErrorHandler("UserId Not Match", StatusCodes.UNAUTHORIZED))
        }

        const user = await User.findById(userId)
        if (!user) {
            return next(new ErrorHandler("Blogs not found", StatusCodes.NOT_FOUND))
        }

        const blogs = await Blog.find({ userId: userId })
        if (!blogs) {
            return next(new ErrorHandler("Blogs not found", StatusCodes.NOT_FOUND))
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Blog fetch sussfully",
            data: blogs
        });

    } catch (error) {
        return next(new ErrorHandler(error.message || 'Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.getAlluserpost = async (req, res, next) => {
    try {
        const blogs = await Blog.find().populate("userId")
        if (!blogs) {
            return next(new ErrorHandler("Blogs not found", StatusCodes.NOT_FOUND))
        }

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Blog fetch sussfully",
            data: blogs
        });

    } catch (error) {
        return next(new ErrorHandler(error.message || 'Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.postdelete = async (req, res, next) => {
    try {
        const { blogId } = req.params
        if (!blogId) {
            return next(new ErrorHandler("BlogId not found", StatusCodes.NOT_FOUND))
        }
        const blogs = await Blog.findById(blogId)
        if (!blogs) {
            return next(new ErrorHandler("Blogs not found", StatusCodes.NOT_FOUND))
        }
        const { blogimg, additionalimg } = blogs;

        if (blogimg) {
            await FilestorageFirebase.deleteFileFromFirebase(blogimg)
        }

        if (additionalimg && Array.isArray(additionalimg)) {
            for (let img of additionalimg) {
                await FilestorageFirebase.deleteFileFromFirebase(img)
            }
        }

        const blogDelete = await Blog.findByIdAndDelete(blogId)

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Blog deteled sussfully",
            data: blogDelete
        });

    } catch (error) {
        return next(new ErrorHandler(error.message || 'Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.updateBlog = async (req, res, next) => {
    try {

        const { name, title, category, date, maindescription, adddescription1, adddescription2 } = req.body;

        const blogimg = req.files.blogimg ? req.files.blogimg[0] : null;
        const additionalimg = req.files.additionalimg || [];

        const { blogId, userId } = req.params;

        if (req.id != userId) {
            return next(new ErrorHandler("UNAUTHORIZED For Updateing", StatusCodes.UNAUTHORIZED));
        }


        if (!name || !title || !category || !date || !maindescription || !adddescription1 || !adddescription2) {
            return next(new ErrorHandler("All fields are required", StatusCodes.BAD_REQUEST));
        }

        if (!blogId) {
            return next(new ErrorHandler("Blog Id Not Found", StatusCodes.BAD_REQUEST));
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return next(new ErrorHandler("Blog not found", StatusCodes.NOT_FOUND));
        }


        if (blogimg) {
            if (blog.blogimg) {
                await FilestorageFirebase.deleteFileFromFirebase(blog.blogimg);
            }
            const blog_img = await FilestorageFirebase.uploadToFierbase(blogimg, userId, "userpost", "bloimages");
            blog.blogimg = blog_img;
        }


        if (additionalimg.length > 0) {
            if (blog.additionalimg && blog.additionalimg.length > 0) {
                for (let img of blog.additionalimg) {
                    await FilestorageFirebase.deleteFileFromFirebase(img);
                }
            }
            // Upload all new additional images concurrently
            const additional_images = await Promise.all(
                additionalimg.map(image => FilestorageFirebase.uploadToFierbase(image, userId, "userpost", "bloimages"))
            );

            blog.additionalimg = additional_images;
        }
        blog.name = name;
        blog.title = title;
        blog.category = category;
        blog.date = date;
        blog.maindescription = maindescription;
        blog.adddescription1 = adddescription1;
        blog.adddescription2 = adddescription2;


        const blogsupdate = await blog.save();

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Blog updated successfully",
            data: blogsupdate
        });

    } catch (error) {
        return next(new ErrorHandler(error.message || 'Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

exports.getupdateblogs = async (req, res, next) => {

    try {
        const { blogId } = req.params

        if (!blogId) {
            return next(new ErrorHandler("BlogId not found", StatusCodes.BAD_REQUEST))
        }

        const blogs = await Blog.findById(blogId)
        if (!blogs) {
            return next(new ErrorHandler("Blogs not found", StatusCodes.NOT_FOUND))
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Blog Data Fetch Successfully",
            data: blogs
        });

    } catch (error) {
        return next(new ErrorHandler(error.message || 'Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

exports.homePageCategory = async (req, res, next) => {
    try {

        const blogs = await Blog.find()
        if (!blogs) {
            return next(new ErrorHandler("Blog not found", StatusCodes.NOT_FOUND));
        }

        let Business = blogs.filter(blog => blog.category === 'Business');
        let Education = blogs.filter(blog => blog.category === 'Education');
        let Food = blogs.filter(blog => blog.category === 'Food');
        let Arts = blogs.filter(blog => blog.category === 'Arts');
        let Fashion = blogs.filter(blog => blog.category === 'Fashion');
        let Entertainment = blogs.filter(blog => blog.category === 'Entertainment');


        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Blog filter Successfully",
            data: {
                Business: Business,
                Education: Education,
                Food: Food,
                Arts: Arts,
                Fashion: Fashion,
                Entertainment: Entertainment
            }
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

exports.blogSerach = async (req, res, next) => {
    try {
        const { title, userId } = req.query

        if (!title || !userId) {
            return next(new ErrorHandler("Title are requried", StatusCodes.BAD_REQUEST))
        }

        const blogs = await Blog.find({ userId: userId, title: { $regex: title, $options: "i" } });
        if (!blogs) {
            return next(new ErrorHandler("Blog not found", StatusCodes.NOT_FOUND))
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Blog find Successfully",
            data: blogs
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.LikeandUnlike = async (req, res, next) => {
    try {
        const { blogId, userId } = req.params

        const blog = await Blog.findById(blogId)
        if (!blog) {
            return next(new ErrorHandler("Blog not Found", StatusCodes.NOT_FOUND))
        }

        const hasLike = blog.like.includes(userId)

        if (hasLike) {
            blog.like.pull(userId)
        } else {
            blog.like.push(userId)
        }

        const like = await blog.save()

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Blog Like Successfully",
            data: like
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.LikeCount = async (req, res, next) => {
    try {
        const { blogId } = req.params

        const blog = await Blog.findById(blogId)
        if (!blog) {
            return next(new ErrorHandler("Blog not Found", StatusCodes.NOT_FOUND))
        }

        const LikeCounts = blog.like.length

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Blog LikeCounts Successfully",
            data: LikeCounts
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

