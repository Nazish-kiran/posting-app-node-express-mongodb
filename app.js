import express from "express";
import path from "path";
import userModel from "./models/user.js";
import postModel from "./models/posts.js";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const isLoggedin = async (req, res, next) => {
  if (!req.cookies.token) {
    res.redirect("/login");
  } else {
    let data = jwt.verify(req.cookies.token, "nazish");
    req.user = data;
    next();
  }
};
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/profile", isLoggedin, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email }).populate('posts')
  console.log(user);
  res.render("profile", { user });
});
app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

app.post("/register", async (req, res) => {
  let { username, name, password, age, email } = req.body;
  let user = await userModel.findOne({ email });
  if (user) {
    return res.status(500).send("User already exists");
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        name,
        password: hash,
        age,
        email,
      });
      let token = jwt.sign({ email: email, userId: user._id }, "nazish");
      res.cookie("token", token);
      console.log(token);
      res.redirect("/profile");
    });
  });
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });

  if (!user) {
    return res.status(500).send("something went wrong");
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: email, userId: user._id }, "nazish");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    } else {
      console.log("something went wrong");
      res.status(500).redirect("/login");
    }
  });
});

app.post("/post", isLoggedin, async (req, res) => {
  let { content } = req.body;
  let user = await userModel.findOne({ email: req.user.email });
  let post = await postModel.create({
    content,
    user: user._id,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
  console.log(post);
});

const PORT = 9092;

app.listen(PORT, () => {
  console.log(`App working on port ${PORT}`);
});
