const express = require('express')
const router = express.Router()

const {
    getAllBooks,
    createBook,
    createBookForm,
    editBookForm,
    deleteBook,
    updateBook
} = require('../controllers/books')

router.route('/').get(getAllBooks).post(createBook) //GET /books (display all the job listings belonging to this user) POST /books (Add a new book listing)
router.route('/new').get(createBookForm) //(Put up the form to create a new entry)
router.route('/edit/:id').get(editBookForm) //GET /books/edit/:id (Get a particular entry and show it in the edit box)
router.route('/update/:id').post(updateBook)//POST /books/update/:id (Update a particular entry)
router.route('/delete/:id').post(deleteBook)//POST /books/delete/:id (Delete an entry)

module.exports = router