const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const FilestorageFirebase = require("../../middleware/multerFileStorgae");
const Advertisement = require("../../Model/Advertisement/Advertisement");
const User = require("../../Model/User/User");

exports.postAd = async (req, res, next) => {

    try {
        const { title, ad_duration, price, status, paymentClear, payment, paynow } = req.body

        const userType = "Advertisement"
        const filetype = "AdPoster"
        const userId = req.id
        const poster = req.file

        if (!poster) {
            return next(new ErrorHandler("Select Poster", StatusCodes.BAD_REQUEST))
        }

        if (!title || !ad_duration || !price) {
            return next(new ErrorHandler("All Filed Are Req", StatusCodes.BAD_REQUEST))
        }

        const Ad_img = await FilestorageFirebase.uploadToFierbase(poster, userId, userType, filetype);

        const addata = await Advertisement.create({
            title,
            ad_duration,
            price,
            status,
            paymentClear,
            paynow,
            payment,
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