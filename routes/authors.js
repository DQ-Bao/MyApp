const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

router.route("/")
    .get(async (req, res) => {
        let searchOption = {};
        if (req.query.name != null && req.query.name !== "") {
            //Search option need to improve!!!!!!!!!
            // req.query.name = req.query.name.replace(/^\s+|\s$|\s+(?=\s)/g, "");
            searchOption.name = new RegExp(req.query.name, "i");
        }
        try {
            const allAuthors = await Author.find(searchOption);
            res.render("authors/index", { authors: allAuthors, searchOption: req.query });
        } catch {
            res.redirect("/");
        }
    })
    .post(async (req, res) => {
        const author = new Author({
            name: req.body.name
        });
        try {
            const newAuthor = await author.save();
            res.redirect(`authors/${newAuthor.id}`);
        } catch {
            res.render("authors/new", {
                author: author,
                errorMessage: "Error when creating Author"
            });
        }
    });

router.route("/new")
    .get((req, res) => {
        res.render("authors/new", { author: new Author() });
    });

router.route("/:id")
    .get(async (req, res) => {
        try {
            const author = await Author.findById(req.params.id);
            const books = await Book.find({ author: author.id });
            res.render("authors/show", {
                author: author,
                booksByAuthor: books
            });
        } catch {
            res.redirect("/");
        }
    })
    .put(async (req, res) => {
        let author;
        try {
            author = await Author.findById(req.params.id);
            author.name = req.body.name;
            await author.save();
            res.redirect(`/authors/${ author.id }`);
        } catch {
            if (author == null) {
                res.redirect("/");
            }
            else {
                res.render("authors/edit", {
                    author: author,
                    errorMessage: "Error when updating Author"
                });
            }
        }
    })
    .delete(async (req, res) => {
        let author;
        try {
            author = await Author.findById(req.params.id);
            await author.remove();
            res.redirect("/authors");
        } catch (error) {
            if (author == null) {
                res.redirect("/");
            }
            else {
                const books = await Book.find({ author: author.id })
                res.render("authors/show", {
                    author: author,
                    booksByAuthor: books,
                    errorMessage: error
                })
            }
        }
    })

router.route("/:id/edit")
    .get(async (req, res) => {
        try {
            const author = await Author.findById(req.params.id)
            res.render("authors/edit", { author: author });
        } catch {
            res.redirect("/authors");
        }
    })

module.exports = router;