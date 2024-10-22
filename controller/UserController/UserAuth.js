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
            subject: "Welcome to Inkverse!",
            html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h1 style="color: #4CAF50;">Welcome, ${fname}!</h1>
                <p>We’re excited to have you join <strong>Inkverse</strong>, a vibrant space for creativity and self-expression.</p>
                
                <h2 style="color: #4CAF50;">Your account has been successfully created!</h2>
                <p>Your profile is currently under review by our team. This process may take up to 24 hours, and you’ll receive an email notification once your profile is approved.</p>
        
                <h3 style="color: #4CAF50;">What’s next?</h3>
                <p>While you wait, here are a few key guidelines to help you get started:</p>
                
                <ul style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; list-style: none; color: #333;">
                    <li style="margin-bottom: 10px;">
                        <strong>🔹 Original Content:</strong> Ensure that all your posts are original or properly credited. Plagiarism may lead to content removal and possible account suspension.
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong>🔹 No Misinformation:</strong> Always share accurate and verified information. Misleading content can result in penalties.
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong>🔹 Respect User Privacy:</strong> Do not share personal details without consent. Privacy violations may lead to restrictions.
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong>🔹 No Explicit Content:</strong> Posting adult or inappropriate content without proper labels or warnings is prohibited. Violators may face account suspension.
                    </li>
                </ul>
        
                <p>Thank you for joining Inkverse! We look forward to seeing your creativity thrive.</p>
        
                <h3 style="color: #4CAF50;">Best regards,</h3>
                <p>The Inkverse Team</p>
            </div>
            `,
        });


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

exports.getprofiledata = async (req, res, next) => {

    try {
        const uId = req.id

        if (!uId) {
            return next(new ErrorHandler("Login first", StatusCodes.UNAUTHORIZED))
        }

        const user = await User.findById(uId);

        if (!user) {
            return next(new ErrorHandler("User Not Found", StatusCodes.NOT_FOUND))
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "User Find Successfully",
            data: user
        })

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR))
    }
}

exports.updateprofile = async (req, res, next) => {
    try {
        const { fname, username, email } = req.body;
        const { userId } = req.params;
        const profile = req.file;
        const userType = "user";
        const fileType = "profile";

        if (!userId) {
            return next(new ErrorHandler("UserId Req", StatusCodes.BAD_REQUEST));
        }

        if (!fname || !username || !email) {
            return next(new ErrorHandler("All Fields are Req", StatusCodes.BAD_REQUEST));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User Not Found", StatusCodes.NOT_FOUND));
        }

        const userWithEmail = await User.findOne({ email: email });
        if (userWithEmail && userWithEmail._id.toString() !== userId) {
            return next(new ErrorHandler("Email already registered", StatusCodes.UNAUTHORIZED));
        }

        if (profile) {
            if (user.profile) {
                await FilestorageFirabse.deleteFileFromFirebase(user.profile);
            }
            const profile_img = await FilestorageFirabse.uploadToFierbase(profile, null, userType, fileType);
            user.profile = profile_img;
        }

        user.fname = fname;
        user.username = username;
        user.email = email;

        const profileUpdate = await user.save();

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Profile Updated successfully",
            data: profileUpdate
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};
