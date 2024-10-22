const User = require("../../Model/User/User");
const OTP = require("../../Model/otp/otp");
const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const otpGenerator = require('otp-generator');
const nodemailer = require("nodemailer");
const bcryptjs = require("bcryptjs");


const transpoter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: "suvagiyaurvish45@gmail.com",
        pass: "dozl xvju ndwj oeeo"
    }
});

exports.postotp = async (req, res, next) => {

    const otp = Math.floor(Math.random() * 10000 + 100)
    try {

        const { email } = req.body

        if (!email) {
            return next(new ErrorHandler("Enter Your Email", StatusCodes.BAD_REQUEST))
        }

        const user = await User.findOne({ email: email })
        if (!user) {
            return next(new ErrorHandler("User Not Found", StatusCodes.UNAUTHORIZED))
        }

        const otpsend = await OTP.create({ otp: otp, email: email, userId: user._id })
        await transpoter.sendMail({
            from: "suvagiyaurvish45@gmail.com",
            to: otpsend.email,
            subject: "Password reset",
            html: `
            <h1>Your Otp is ${otpsend.otp} </h1> `,
        })

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "OTP Send sussfully",
            data: otpsend
        });


    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.verifyotp = async (req, res, next) => {

    try {
        const { otp } = req.body
        if (!otp) {
            return next(new ErrorHandler("Enter Your Otp", StatusCodes.BAD_REQUEST))
        }

        const verifyotp = await OTP.findOne({ otp: otp })

        if (!verifyotp) {
            return next(new ErrorHandler("Enter Correct OTP", StatusCodes.UNAUTHORIZED))
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "OTP Verify sussfully",
            data: verifyotp
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.updatepass = async (req, res, next) => {
    try {

        const { newpassword, conformpassword } = req.body
        const { userId } = req.params

        if (!newpassword || !conformpassword) {
            return next(new ErrorHandler("all filed are req", StatusCodes.BAD_REQUEST))
        }

        if (newpassword != conformpassword) {
            return next(new ErrorHandler("password and comformpass not match", StatusCodes.BAD_REQUEST))
        }

        const userfind = await User.findById(userId)

        if (!userfind) {
            return next(new ErrorHandler("User Id Not found", StatusCodes.NOT_FOUND))
        }

        const hashpassword = await bcryptjs.hash(newpassword, 10)

        userfind.password = hashpassword;
        const updatepass = await userfind.save();

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Password Updated sussfully",
            data: updatepass
        });

    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

exports.deleteotp = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return next(new ErrorHandler("userId not found", StatusCodes.NOT_FOUND));
        }

        const otp = await OTP.findOne({userId:userId});
        if (!otp) {
            return next(new ErrorHandler("Otp not found", StatusCodes.NOT_FOUND));
        }

        const otpdelete = await OTP.findByIdAndDelete(otp._id);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Otp Delete success",
            data: otpdelete,
        });
    } catch (error) {
        return next(
            new ErrorHandler(
                error.message || "INTERNAL_SERVER_ERROR",
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        );
    }
};

