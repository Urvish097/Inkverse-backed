const { ref } = require("firebase/storage");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Blogs = new Schema({
    blogimg: {
        type: String,
        required: true,
    },
    additionalimg: {
        type: [String],
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true
    },
    like:{
        type:[],
        required:false
    },
    date: {
        type: Date,
        required: true
    },
    maindescription: {
        type: String,
        required: true
    },
    adddescription1: {
        type: String,
        required: true
    },
    adddescription2: {
        type: String,
        required: true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    role: {
        type: String,
        default: "Blog"
    },

});

const blog = mongoose.model("Blog", Blogs);

module.exports = blog;