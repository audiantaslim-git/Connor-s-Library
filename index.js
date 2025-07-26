import express, { urlencoded } from "express";
import axios from "axios";

const app = express();
const PORT = 3000;

const API_URL = "http://localhost:4000";

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

app.get("/home", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/`);

    res.render("index.ejs", {
      content: response.data.content,
      activePage: "home",
      content1: response.data.content1,
      content2: response.data.content2,
      content3: response.data.content3,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching data" });
  }
});

app.get("/search", async (req, res) => {
  const query = req.query.searchQuery;
  const page = parseInt(req.query.page) || 1;
  const response = await axios.get(`${API_URL}/search/${query}?page=${page}`);
  res.render("search.ejs", {
    content: response.data.content,
      query: response.data.query,
      currentPage: page,
      totalPages: response.data.totalPages,
      totalItems: response.data.totalItems,
      activePage: response.data.activePage,
  });
});
