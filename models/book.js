const mongoose = require("mongoose");
const path = require("path");

const coverBasePath = "uploads/bookCovers";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    coverName: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Author"
    }
});
bookSchema.virtual("coverPath").get(function() {
    if (this.coverName != null) return path.join("/", coverBasePath, this.coverName);
});

module.exports = mongoose.model("Book", bookSchema);
module.exports.coverBasePath = coverBasePath;