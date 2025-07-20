import express, { urlencoded } from "express";
import axios from "axios";

const app = express();
const PORT = 3000;


const API_URL = "https://www.googleapis.com/books/v1/volumes/";
const libraryVolumeId = [
  {
    bookId: 1,
    volumeId: "Nh9PDwAAQBAJ",
  },
  {
    bookId: 2,
    volumeId: "z2z_6hLoPmgC",
  },
  {
    bookId: 3,
    volumeId: "szMU9omwV0wC",
  },
  {
    bookId: 4,
    volumeId: "jeSQNXk4ug8C",
  },
  {
    bookId: 5,
    volumeId: "sL_ZCwAAQBAJ",
  },
];

const bookShelves = ["fiction", "romance", "fantasy"];

app.locals.truncate = (text, wordLimit) => {
  const words = text.split(" ");
  return words.length > wordLimit
    ? words.slice(0, wordLimit).join(" ") + "..."
    : text;
};

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", async (req, res) => {
  try {
    const bookContent = [];

    const bookPromises = libraryVolumeId.map((book) =>
      axios.get(`${API_URL}${book.volumeId}?key=${myAPIKey}`)
    );

    const results = await Promise.all(bookPromises);
    const booksData = results.map((result) => result.data);

    booksData.forEach((book) => {
      bookContent.push({
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors,
        image: book.volumeInfo.imageLinks?.thumbnail || "No image available",
      });
    });

    const resultCategory = bookShelves.map((category) =>
      axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=subject:${category}&maxResults=5&key=${myAPIKey}`
      )
    );

    const categoryResults = await Promise.all(resultCategory);
    const bookCategory = categoryResults.map(
      (result) => result.data.items || []
    );


    const fictionContent = bookCategory[0].map((book) => ({
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors || ["Unknown Author"],
      image: book.volumeInfo.imageLinks?.thumbnail || "No image available",
    }));

    const romanceContent = bookCategory[1].map((book) => ({
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors || ["Unknown Author"],
      image: book.volumeInfo.imageLinks?.thumbnail || "No image available",
    }));

    const fantasyContent = bookCategory[2].map((book) => ({
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors || ["Unknown Author"],
      image: book.volumeInfo.imageLinks?.thumbnail || "No image available",
    }));

    res.render("index.ejs", {
      content: bookContent,
      activePage: "home",
      content1: fictionContent,
      content2: romanceContent,
      content3: fantasyContent
    });

    // res.json(bookContent);

  } catch (error) {
    console.error("Error fetching book data:", error.message);
    res.render("index.ejs", { books: [] });
  }
});

app.get("/search", async (req, res) => {
  const query = req.query.searchQuery;
  const page = parseInt(req.query.page) || 1;
  const maxResults = 10;
  const startIndex = (page - 1) * maxResults;

  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&filter=partial&startIndex=${startIndex}&maxResults=${maxResults}&key=${myAPIKey}`
    );

    const bookSearch = response.data.items || [];
    const totalItems = response.data.totalItems || 0;
    const totalPages = Math.ceil(totalItems / maxResults);

    console.log(
      "Search results:",
      bookSearch,
      "Total items:",
      totalItems,
      "Total pages:",
      totalPages
    );
    const books = bookSearch.map((book) => ({
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors || ["Unknown Author"],
      image: book.volumeInfo.imageLinks?.thumbnail || "No image available",
      description: book.volumeInfo.description || "No description available",
      averageRating: book.volumeInfo.averageRating || "No rating available",
    }));

    res.render("search.ejs", {
      content: books,
      query,
      currentPage: page,
      totalPages,
      totalItems,
      activePage: "search",
    });
  } catch (error) {
    console.error("Error fetching search results:", error.message);
    res.status(500).send("Something went wrong.");
  }
});
