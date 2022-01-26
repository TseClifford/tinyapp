const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

const generateRandomString = function () {
  const randomStringLength = 6
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''

  for (let i = 0; i < randomStringLength; i++) {
    const randomCharIndex = Math.floor((Math.random() * characters.length))
    randomString += characters[randomCharIndex]
  }
  return randomString
}

const duplicateEmail = function (newEmail) {
  let dupeValue = false

  Object.values(users).forEach(user => {
    if (user.email === newEmail) {
      return dupeValue = true;
    }
  })
  return dupeValue
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  const templateVars = {
    "user_id": users[req.cookies["user_id"]],
    greeting: 'Hello World!'
  };
  res.render("hello_world", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    "user_id": users[req.cookies["user_id"]],
  };
  res.render("registration", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    "user_id": users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    "user_id": users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    "user_id": users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send(`Please enter an email and password.`)

  } else if (duplicateEmail(req.body.email) === true) {
    res.status(400).send(`This email is already registered.`)

  } else {
    let newUserId = generateRandomString()
    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: req.body.password
    }
    res.cookie('user_id', newUserId)
    res.redirect(`/urls/`)
  }
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString()
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls/`)
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL
  res.redirect(`/urls/`)
});

app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.user_id)
  res.redirect(`/urls/`)
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect(`/urls/`)
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});