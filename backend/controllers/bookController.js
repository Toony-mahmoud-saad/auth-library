const Book = require('../models/Book');
const { encryptData, decryptData } = require('../config/encryption');

// Get all books (for users)
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().select('-__v');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single book (for users)
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select('-__v');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create book (admin only)
exports.createBook = async (req, res) => {
  try {
    const { title, author, description, publishedYear, isbn } = req.body;
    
    const book = new Book({
      title,
      author,
      description,
      publishedYear,
      isbn,
    });
    
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update book (admin only)
exports.updateBook = async (req, res) => {
  try {
    const { title, author, description, publishedYear, isbn } = req.body;
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, description, publishedYear, isbn, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete book (admin only)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};