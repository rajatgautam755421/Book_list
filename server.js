const express = require("express");
const { connect } = require("mongoose");
const Post = require("./models/post");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const { auth, requiresAuth } = require("express-openid-connect");
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

//Athentication
const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: "http://localhost:3000",
  clientID: "mEIRzEIqH6OqoAffPWBVWw34NmxdYArb",
  issuerBaseURL: "https://dev-pid1954k.us.auth0.com",
  secret: "sdbjkfheiuhfioknerkgnjkerkjgnrekjrfuiehfiehrjghuierhkflndsjknkj",
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
//Root url
app.get("/", (req, res) => {
  res.send(
    req.oidc.isAuthenticated() ? { msg: "Welcome" } : { msg: "Logged Out",logIn : "http://localhost:3000/login" }
  );
  res.send({ msg: "Book List" });
});

//Profile Page
app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

//Complete book list
app.get("/findall", (req, res) => {
  Post.find({}, function (err, Post) {
    res.send(Post);
  });
});

//Posting an element
app.post("/", (req, res) => {
  const user = new Post({
    bookName: req.body.bookName,
    authorName: req.body.authorName,
    image: req.body.image,
  });
  user
    .save()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//finding a specific element
app.get("/search/:id", async (req, res) => {
  try {
    const result = await Post.findById(req.params.id, {
      useFindAndModify: false,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).send({ error: "No such file" });
  }
});
//updating a single data in database
app.get("/update/:id", async (req, res) => {
  try {
    const result1 = await Post.findByIdAndUpdate(
      req.params.id,
      { bookName: "Rohit Gautam Book" },
      { useFindAndModify: false }
    );
    res.status(200).send({ message: "DataBase Updated" });
  } catch (error) {
    res.status(400).send({ error: "Error Updating" });
  }
});

//Delete a specific element
app.get("/delete/:id", async (req, res) => {
  const book = req.params.bookName;
  try {
    const result = await Post.findByIdAndRemove(req.params.id, {
      useFindAndModify: false,
    });
    res.status(200).send({ message: "Item Deleted" });
  } catch (error) {
    res.status(400).send({ error: "Error Deleting" });
  }
});

//404 Page Not Found Error
app.use((req, res, next) => {
  res.status(404).send({ error: "Page Not Found" });
});

//Connection to local mongoDB
connect(
  "mongodb://localhost:27017/books",
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => {
    try {
      console.log("Connected to database");
    } catch (error) {
      console.log(error);
    }
  }
);

//App listening to port 5000
app.listen(PORT, () => {
  console.log(`Server listening at ${PORT} `);
});
