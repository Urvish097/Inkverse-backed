const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OtpSChema = new Schema({
    otp: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

});

const Otp = mongoose.model("Otp", OtpSChema);

module.exports = Otp;