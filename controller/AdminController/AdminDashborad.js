const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const User = require("../../Model/User/User");
const Blog = require("../../Model/Blogs/Blogs");
const FilestorageFirebase = require("../../middleware/multerFileStorgae");


exports.getDashboard = async (req, res, next) => {
    try {

        const TotalUser = await User.countDocuments()
        const TotalBlog = await Blog.countDocuments()

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Dashboard fetch Successfully",
            data: {
                TotalUser: TotalUser,
                TotalBlog: TotalBlog
            }
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

exports.getDashboardChat = async (req, res, next) => {
    try {
        const blogs = await Blog.find();

        if (!blogs || blogs.length === 0) {
            return next(new ErrorHandler("No blogs found", StatusCodes.NOT_FOUND));
        }

        const monthlyBlogCount = Array(12).fill(0);

        blogs.forEach((blog) => {

            const month = new Date(blog.date).getMonth();

            monthlyBlogCount[month]++;
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Chart data fetched successfully",
            data: monthlyBlogCount,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

exports.AdminblogSerach = async (req, res, next) => {
    try {
        const { title } = req.query

        if (!title) {
            return next(new ErrorHandler("Title are requried", StatusCodes.BAD_REQUEST))
        }

        const blogs = await Blog.find({ title: { $regex: title, $options: "i" } });
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
};

exports.AdminUser = async (req, res, next) => {
    try {

        const user = await User.find()

        if (!user) {
            return next(new ErrorHandler("User Not Found", StatusCodes.NOT_FOUND))
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "User Fetch SuccessFully",
            data: user
        })

    } catch (error) {
        return next(new ErrorHandler(error.message), StatusCodes.INTERNAL_SERVER_ERROR)
    }
};

exports.AdminUserFind = async (req, res, next) => {
    try {
        const { username } = req.query
        if (!username) {
            return next(new ErrorHandler("Username Not Found", StatusCodes.NOT_FOUND))
        }

        const user = await User.find({ username: { $regex: username, $options: "i" } })
        if (!user) {
            return next(new ErrorHandler("User Not Found", StatusCodes.NOT_FOUND))
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "User Find SuccssFully",
            data: user
        })

    } catch (error) {
        return next(new ErrorHandler(error.message), StatusCodes.INTERNAL_SERVER_ERROR)
    }
};

exports.AdminDeleteUser = async (req, res, next) => {
    try {

        const { userId } = req.params

        if (!userId) {
            return next(new ErrorHandler("UserId Not Found", StatusCodes.NOT_FOUND))
        }

        const user = await User.findById(userId)

        if (!user) {
            return next(new ErrorHandler("User Not Found", StatusCodes.NOT_FOUND))
        }

        const { profile } = user

        if (profile) {
            await FilestorageFirebase.deleteFileFromFirebase(profile)
        }

        const userDelete = await User.findByIdAndDelete(userId)

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "User Delete Successfully",
            data: userDelete
        });

    } catch (error) {
        return next(new ErrorHandler(error.message), StatusCodes.INTERNAL_SERVER_ERROR)
    }
};
