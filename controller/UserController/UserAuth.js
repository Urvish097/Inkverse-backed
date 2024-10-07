const User = require("../../Model/User/User");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const FilestorageFirabse = require("../../middleware/multerFileStorgae")

const transpoter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: "suvagiyaurvish45@gmail.com",
        pass: "dozl xvju ndwj oeeo"
    }
});

exports.postUsersignUp = async (req, res, next) => {
    try {
        const { fname, username, password, email, confirmpassword } = req.body
        const userType = "user"
        const fileType = "profile"

        const profile = req.file
        if (!profile) {
            return next(new ErrorHandler("Select File", StatusCodes.BAD_REQUEST))
        }

        if (!fname || !username || !password || !confirmpassword || !email) {
            return next(new ErrorHandler("All Fileds are req", StatusCodes.BAD_REQUEST))
        }
        if (password != confirmpassword) {
            return next(new ErrorHandler("Password and comformpassword not match", StatusCodes.BAD_REQUEST))
        }
        const user = await User.findOne({ email: email })
        if (user) {
            return next(new ErrorHandler("Email already register", StatusCodes.UNAUTHORIZED))
        }
        await transpoter.sendMail({
            from: "suvagiyaurvish45@gmail.com",
            to: email,
            subject: "Blog SignUp",
            text: "Welcome To Inkverse",
            html: `
        <h1>Welcome  ${fname}</h1> `,
        })

        const profile_picture = await FilestorageFirabse.uploadToFierbase(profile, null, userType, fileType);

        const hasspassword = await bcryptjs.hash(password, 10);

        const result = await User.create({
            fname: fname,
            username: username,
            password: hasspassword,
            email: email,
            profile: profile_picture
        });

        return res.status(StatusCodes.CREATED).json({
            message: "USER SIGNUP SUCCESSFUL",
            data: result,
            success: true
        })

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR))
    }
}

exports.postlogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("All feild are require", StatusCodes.BAD_REQUEST))
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return next(new ErrorHandler("User Not Found", StatusCodes.UNAUTHORIZED))
        }

        const passcomm = await bcryptjs.compare(password, user.password)

        if (!passcomm) {
            return next(new ErrorHandler("Password Not Match", StatusCodes.UNAUTHORIZED))
        }
        const token = await jwt.sign(
            {
                userId: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '365d' });

        return res.status(StatusCodes.OK).json({
            message: "USER LOGIN SUCSSEFULYY",
            data: user,
            success: true,
            Token: token
        })
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR))
    }
}