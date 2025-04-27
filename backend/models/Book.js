const mongoose = require('mongoose');
const { encryptData, decryptData } = require('../config/encryption');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
    set: encryptData,  // Automatically encrypt when setting
    get: decryptData   // Automatically decrypt when getting
  },
  description: {
    type: String,
  },
  publishedYear: {
    type: Number,
  },
  isbn: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { getters: true },  // Ensure decryption when converting to JSON
  toObject: { getters: true } // Ensure decryption when converting to object
});

// Update timestamp on save
bookSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Book', bookSchema);