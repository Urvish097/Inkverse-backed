const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const User = require("../../Model/User/User");
const nodemailer = require("nodemailer");

const transpoter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: "suvagiyaurvish45@gmail.com",
        pass: "dozl xvju ndwj oeeo",
    },
});

exports.UserStatus = async (req, res, next) => {
    try {
        const { userId, status } = req.query

        if (!userId || !status) {
            return next(new ErrorHandler("UserId and status requried", StatusCodes.BAD_REQUEST))
        }
        const user = await User.findById(userId)
        if (!user) {
            return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND))
        }

        user.status = status
        const userStatus = await user.save()

        if (status === 'Active') {
            await transpoter.sendMail({
                from: "darshanchovatiya30@gmail.com",
                to: userStatus.email,
                subject: "Account Approved",
                html: `
                  <h1>Mr/Ms : ${userStatus.username}</h1>
                  <h2>Your Account has been Approved by Admin now you can create BlogPost</h2>
                  <h2>If you are Login then please Login Again</h2>
                `,
            });
        } else if (status === 'Block') {
            await transpoter.sendMail({
                from: "darshanchovatiya30@gmail.com",
                to: userStatus.email,
                subject: "Account Blocked",
                html: `
                  <h1>Mr/Ms : ${userStatus.username}</h1>
                  <h2>Your Account has been Block by Admin now you can Not create BlogPost</h2>
                  <h2>We are writing to inform you that some content you recently uploaded to our platform has been flagged as inappropriate. Our community guidelines are in place to ensure a safe and respectful environment for all users, and it appears that the content you uploaded violates the following guideline(s): </h2>
                `,
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `User ${status} successfully`,
            data: userStatus,
        });

    } catch (error) {
        return next(
            new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}