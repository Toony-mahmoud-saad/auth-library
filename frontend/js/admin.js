// Load books for admin when page loads
document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.includes("admin.html")) {
    await loadAdminBooks();

    // Initialize form submission
    document
      .getElementById("add-book-form")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        await addBook();
      });
  }
});

// Load books for admin management
async function loadAdminBooks() {
  const booksList = document.getElementById("admin-books-list");
  if (!booksList) return;

  booksList.innerHTML = "<p>Loading books...</p>";

  try {
    const response = await makeAuthRequest("/books");
    const books = await response.json();

    if (!response.ok) {
      booksList.innerHTML =
        "<p>Error loading books. Please try again later.</p>";
      return;
    }

    if (books.length === 0) {
      booksList.innerHTML = "<p>No books available.</p>";
      return;
    }

    booksList.innerHTML = "";
    books.forEach((book) => {
      const bookCard = document.createElement("div");
      bookCard.className = "book-card";
      bookCard.innerHTML = `
              <h3>${book.title}</h3>
              <p class="book-author">${book.author}</p>
              ${book.description ? `<p>${book.description}</p>` : ""}
              ${
                book.publishedYear
                  ? `<p><strong>Year:</strong> ${book.publishedYear}</p>`
                  : ""
              }
              <p><strong>ISBN:</strong> ${book.isbn}</p>
              <div class="book-actions">
                  <button class="btn btn-edit" data-id="${
                    book._id
                  }">Edit</button>
                  <button class="btn btn-danger" data-id="${
                    book._id
                  }">Delete</button>
              </div>
          `;
      booksList.appendChild(bookCard);
    });

    // Add event listeners to buttons
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const bookId = e.target.getAttribute("data-id");
        editBook(bookId);
      });
    });

    document.querySelectorAll(".btn-danger").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const bookId = e.target.getAttribute("data-id");
        deleteBook(bookId);
      });
    });
  } catch (err) {
    console.error("Error loading books:", err);
    booksList.innerHTML = "<p>Error loading books. Please try again later.</p>";
  }
}

// Add new book
async function addBook() {
  const title = document.getElementById("book-title").value;
  const author = document.getElementById("book-author").value;
  const description = document.getElementById("book-description").value;
  const publishedYear = document.getElementById("book-year").value;
  const isbn = document.getElementById("book-isbn").value;

  try {
    const response = await makeAuthRequest("/books", "POST", {
      title,
      author,
      description,
      publishedYear: publishedYear ? parseInt(publishedYear) : undefined,
      isbn,
    });

    if (response.ok) {
      // Clear form and reload books
      document.getElementById("add-book-form").reset();
      await loadAdminBooks();
    } else {
      const error = await response.json();
      alert(error.message || "Failed to add book");
    }
  } catch (err) {
    console.error("Error adding book:", err);
    alert("An error occurred while adding the book");
  }
}

// Edit book (placeholder - would need a modal or separate page)
function editBook(bookId) {
  alert(`Edit book with ID: ${bookId}`);
  // In a real implementation, you would:
  // 1. Fetch the book details
  // 2. Populate a form with the existing data
  // 3. Submit the updated data to the server
}

// Delete book
async function deleteBook(bookId) {
  if (!confirm("Are you sure you want to delete this book?")) return;

  try {
    const response = await makeAuthRequest(`/books/${bookId}`, "DELETE");

    if (response.ok) {
      await loadAdminBooks();
    } else {
      const error = await response.json();
      alert(error.message || "Failed to delete book");
    }
  } catch (err) {
    console.error("Error deleting book:", err);
    alert("An error occurred while deleting the book");
  }
}
