// Load books when page loads
document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.includes("books.html")) {
    await loadBooks();
  }
});

// Load all books
async function loadBooks() {
  const booksList = document.getElementById("books-list");
  if (!booksList) return;

  booksList.innerHTML = "<p>Loading books...</p>";

  try {
    const response = await fetch(`${API_BASE_URL}/books`);
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
          `;
      booksList.appendChild(bookCard);
    });
  } catch (err) {
    console.error("Error loading books:", err);
    booksList.innerHTML = "<p>Error loading books. Please try again later.</p>";
  }
}
