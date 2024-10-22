const { ErrorHandler } = require("../../middleware/errorHandler");
const { StatusCodes } = require("http-status-codes");
const Advertisement = require("../../Model/Advertisement/Advertisement");
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

exports.AdmingetAllads = async (req, res, next) => {

    try {

        const ads = await Advertisement.find().populate("userId")
        if (!ads) {
            return next(new ErrorHandler("No Advertisement Found", StatusCodes.NOT_FOUND))
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Ads Found SuccessFully",
            data: ads
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }

};

exports.getEarningDashboardChat = async (req, res, next) => {
    try {
        const Ads = await Advertisement.find();

        if (!Ads || Ads.length === 0) {
            return next(new ErrorHandler("No Ads Found", StatusCodes.NOT_FOUND));
        }

        const monthlyEarnings = Array(12).fill(0);

        Ads.forEach((ad) => {
            if (ad.paymentClear) {
                const month = new Date(ad.createdAt).getMonth();
                monthlyEarnings[month] += parseFloat(ad.price);
            }
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Monthly earnings fetched successfully",
            monthlyEarnings
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

exports.enableForPayment = async (req, res, next) => {
    try {

        const { adId } = req.params;


        if (!adId) {
            return next(new ErrorHandler("AdId Not Found", StatusCodes.NOT_FOUND))
        }

        const Ad = await Advertisement.findById(adId).populate("userId")

        if (!Ad) {
            return next(new ErrorHandler("Ad Not Found"), StatusCodes.NOT_FOUND)
        }

        const userId = Ad.userId;
        if (!userId || !userId.email) {
            return next(new ErrorHandler("User email not found", StatusCodes.NOT_FOUND));
        }

        Ad.paynow = 1

        await Ad.save()

        await transpoter.sendMail({
            from: "suvagiyaurvish45@gmail.com",
            to: userId.email,
            subject: "Your Advertisement Has Been Approved!",
            html: `
         <div style="font-family: Arial, sans-serif; background-color: #f7f9fc; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333;">🎉 Congratulations! Your Advertisement is Approved!</h2>
        <p style="color: #555;">
            Hi there, <br/>
            We're excited to inform you that your advertisement on <strong>Inkverse</strong> has been successfully approved by our admin team!
        </p>
        <p style="color: #555;">
            Here are the details for your advertisement:
        </p>
        <ul style="list-style: none; padding-left: 0;">
            <li><strong>Title:</strong> ${Ad.title}</li>
            <li><strong>Duration:</strong> ${Ad.ad_duration}</li>
            <li><strong>Price:</strong> $${Ad.price}</li>
        </ul>
        <p style="color: #555;">
            To ensure your advertisement runs smoothly, please make the necessary payment for your ad.
        </p>
        <p style="color: #555;">
            After your payment is successfully processed, your advertisement will go live within 2-3 hours! 🎉
        </p>
        <hr style="border: 1px solid #eaeaea; margin: 20px 0;" />
        <footer style="text-align: center; font-size: 14px; color: #999;">
            <p>© ${new Date().getFullYear()} Inkverse. All rights reserved.</p>
        </footer>
    </div>
            `,
        });

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Ad enableForPayment",
            data: Ad
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}

exports.statusActive = async (req, res, next) => {
    try {

        const { adId } = req.params

        if (!adId) {
            return next(new ErrorHandler("AdId Not found"))
        }

        const Ad = await Advertisement.findById(adId)

        if (!Ad) {
            return next(new ErrorHandler("Ad Not Found"))
        }

        Ad.status = "active"

        await Ad.save()

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Status Active",
            data: Ad
        })

    } catch (error) {
        return next(new ErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}