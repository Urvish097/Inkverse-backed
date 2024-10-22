const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const FilestorageFirebase = require("../../middleware/multerFileStorgae");
const Advertisement = require("../../Model/Advertisement/Advertisement");
const User = require("../../Model/User/User");
const nodemailer = require("nodemailer");

const transpoter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: "suvagiyaurvish45@gmail.com",
        pass: "dozl xvju ndwj oeeo"
    }
});

exports.postAd = async (req, res, next) => {

    try {
        const { title, ad_duration, price, status, paymentClear, payment, paynow, phone } = req.body

        const userType = "Advertisement"
        const filetype = "AdPoster"
        const userId = req.id
        const poster = req.file

        if (!poster) {
            return next(new ErrorHandler("Select Poster", StatusCodes.BAD_REQUEST))
        }

        if (!title || !ad_duration || !price || !phone) {
            return next(new ErrorHandler("All Filed Are Req", StatusCodes.BAD_REQUEST))
        }

        const Ad_img = await FilestorageFirebase.uploadToFierbase(poster, userId, userType, filetype);

        await transpoter.sendMail({
            from: "suvagiyaurvish45@gmail.com",
            to: req.email,
            subject: "Your Advertisement is Under Review!",
            html: `
           <div style="font-family: Arial, sans-serif; background-color: #f7f9fc; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333;">Your Advertisement is Created!🎉</h2>
        <p style="color: #555;">
            Hi there, <br/>
            Thank you for submitting your advertisement to <strong>Inkverse</strong>! We're excited to let you know that your advertisement is currently under review by our admin team.
        </p>
        <p style="color: #555;">
            Once your advertisement is approved, you will receive another email notification. In the meantime, feel free to explore our platform and connect with our community!
        </p>
        <hr style="border: 1px solid #eaeaea; margin: 20px 0;" />
        <footer style="text-align: center; font-size: 14px; color: #999;">
            <p>© ${new Date().getFullYear()} Inkverse. All rights reserved.</p>
        </footer>
    </div>
            `,
        });

        const addata = await Advertisement.create({
            title,
            ad_duration,
            price,
            status,
            paymentClear,
            paynow,
            payment,
            phone,
            poster: Ad_img,
            userId: userId
        })

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Ad added Successfully",
            data: addata
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.getAd = async (req, res, next) => {

    try {
        const { userId } = req.params
        const uId = req.id

        if (userId != uId) {
            return next(new ErrorHandler("UserId Not Match", StatusCodes.UNAUTHORIZED))
        }

        const user = await User.findById(userId)

        if (!user) {
            return next(new ErrorHandler("User Not Found", StatusCodes.NOT_FOUND))
        }

        const Ads = await Advertisement.find({ userId: userId })

        if (!Ads) {
            return next(new ErrorHandler("No Ads Found", StatusCodes.NOT_FOUND))
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Ads Find Successfully",
            data: Ads
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.getadHome = async (req, res, next) => {
    try {

        const status = "active"
        const Ad = await Advertisement.find({ status: status })

        if (!Ad) {
            return next(new ErrorHandler("No Ad Found", StatusCodes.NOT_FOUND))
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Ad fetch succuess",
            data: Ad
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.adsfilter = async (req, res, next) => {
    try {

        const Ad = await Advertisement.find()

        if (!Ad) {
            return next(new ErrorHandler("Ad Not Found", StatusCodes.NOT_FOUND))
        }

        let pending = Ad.filter(ads => ads.status === "pending");
        let active = Ad.filter(ads => ads.status === "active");

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Ad filter success",
            data: {
                pending: pending,
                active: active
            }
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}