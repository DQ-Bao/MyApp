const mongoose = require("mongoose");

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
    coverImage: {
        type: Buffer,
        required: true
    },
    coverType: {
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
    if (this.coverImage != null && this.coverType != null) {
        return `data:${this.coverType};charset=utf-8;base64,${this.coverImage.toString("base64")}`;
    }
});

module.exports = mongoose.model("Book", bookSchema);