const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const uploadPath = path.join("public", Book.coverBasePath);
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype)); 
    }
})

router.get("/", async (req, res) => {
    let query = Book.find();
    if (req.query.title != null && req.query.title != "") {
        query = query.regex("title", new RegExp(req.query.title, "i"));
    }
    if (req.query.publishBefore != null && req.query.publishBefore != "") {
        query = query.lte("publishDate", req.query.publishBefore);
    }
    if (req.query.publishAfter != null && req.query.publishAfter != "") {
        query = query.gte("publishDate", req.query.publishAfter);
    }
    try {
        const books = await query.exec();
        res.render("books/index", {
            books: books,
            searchOption: req.query
        });
    } catch {
        res.redirect("/");
    }
});

router.get("/new", async (req, res) => {
    renderNewBookPage(res, new Book());
});

router.post("/", upload.single("cover"), async (req, res) => {
    const fileName = req.file == null ? null : req.file.filename;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverName: fileName
    })
    try {
        const newBook = await book.save();
        // res.redirect(`books/${ newBook.id }`);
        res.redirect("/books");
    } catch {
        if (book.coverName != null) {
            fs.unlink(path.join(uploadPath, book.coverName), err => {
                if (err) console.error(err);
            })
        }
        renderNewBookPage(res, book, true);
    }
});

async function renderNewBookPage(res, book, hasErr = false) {
    try {
        const authors = await Author.find({});
        const params = { authors: authors, book: book };
        if (hasErr) params.errorMessage = "Error when creating Book";
        res.render("books/new", params);
    } catch {
        res.redirect("/books");
    }
}

module.exports = router;