const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

router.route("/")
    .get(async (req, res) => {
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
    })
    .post(async (req, res) => {
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            description: req.body.description,
            publishDate: new Date(req.body.publishDate),
            pageCount: req.body.pageCount,
        })
        saveCover(book, req.body.cover);
        try {
            const newBook = await book.save();
            res.redirect(`books/${ newBook.id }`);
        } catch {
            renderNewBookPage(res, book, true);
        }
    });
    
router.route("/new")
    .get(async (req, res) => {
        renderNewBookPage(res, new Book());
    });

router.route("/:id")
    .get(async (req, res) => {
        try {
            const book = await Book.findById(req.params.id).populate("author").exec();
            res.render("books/show", {
                book: book
            })
        } catch {
            res.redirect("/");
        }
    })
    .put(async (req, res) => {
        let book;
        try {
            book = await Book.findById(req.params.id);
            book.title = req.body.title;
            book.author = req.body.author;
            book.publishDate = new Date(req.body.publishDate);
            book.pageCount = req.body.pageCount;
            book.description = req.body.description;
            if (req.body.cover != null && req.body.cover !== "") {
                saveCover(book, req.body.cover);
            }
            await book.save();
            res.redirect(`/books/${ book.id }`);
        } catch {
            if (book != null) {
                renderEditPage(res, book, true);
            }
            else {
                res.redirect("/");
            }
        }
    })
    .delete(async (req, res) => {
        let book;
        try {
            book = await Book.findById(req.params.id);
            await book.remove();
            res.redirect("/books");
        } catch {
            if (book != null) {
                res.render("books/show", {
                    book: book,
                    errorMessage: "Error: Could not delete Book"
                });
            }
            else {
                res.redirect("/");
            }
        }
    });

router.route("/:id/edit")
    .get(async (req, res) => {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    })

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
async function renderEditPage(res, book, hasErr = false) {
    try {
        const authors = await Author.find({});
        const params = { authors: authors, book: book };
        if (hasErr) params.errorMessage = "Error when updating Book";
        res.render("books/edit", params);
    } catch {
        res.redirect("/books");
    }
}
function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return;
    const cover = JSON.parse(coverEncoded);
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, "base64");
        book.coverType = cover.type;
    }
}

module.exports = router;