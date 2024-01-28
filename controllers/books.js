const Book = require('../models/Book')
const handleErrors = require("../util/parseValidationErr");

// GET all books for the current user
const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find({ createdBy: req.user._id });
        res.render('books', { books });
    } catch (error) {
        handleErrors(error, req, res);
    }
}

// POST a new book
const createBook = async (req, res) => {
    try {
        const book = await Book.create({ ...req.body, createdBy: req.user._id });
        res.redirect('/books');
    } catch (error) {
        handleErrors(error, req, res);
    }
}

// GET the form for adding a new book
const createBookForm = async (req, res) => {
    try {
        res.render('book', { book: null });
    } catch (error) {
        handleErrors(error, req, res);
    }
}

// GET a specific book for editing
const editBookForm = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!book) {
            res.status(404);
            req.flash('error', 'Book not found');
            return;
        }
        res.render('book', { book });
    } catch (error) {
        console.error('Error in editBookForm:', error); // Add this line
        handleErrors(error, req, res);
    }
}

const deleteBook = async (req, res) => {
    try {
        const book = await Book.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!book) {
            res.status(404);
            req.flash('error', 'Book not found');
            return res.redirect('/books');
        }
        req.flash('success', 'Meal was deleted');
        res.redirect('/books');
    } catch (error) {
        handleErrors(error, req, res);
    }
}

const updateBook = async (req, res) => {
    try {
        const book = await Book.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!book) {
            res.status(404);
            req.flash('error', 'Book not found');
            return;
        }
        res.redirect('/books');
    } catch (error) {
        handleErrors(error, req, res, '/books/edit/' + req.params.id);
    }
}

module.exports = {
    getAllBooks, createBook, createBookForm, editBookForm, deleteBook, updateBook
}