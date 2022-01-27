const express = require("express");
const app = express();
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const PORT = 8080; // default port 8080
const salt = bcrypt.genSaltSync(10);

const {
  generateRandomString,
  checkExisting,
  getUserByEmail,
  urlsForUser } = require("./helpers")

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)
  }
};

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["mySuperSecretKey"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect(`/urls`);
  } else {
    res.redirect(`/login`);
  }
});

app.get("/login", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect(`/urls`);
  } else {
    const templateVars = {
      "user_id": users[req.session["user_id"]],
    };
    res.render("login", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect(`/urls`);
  } else {
    const templateVars = {
      "user_id": users[req.session["user_id"]],
    };
    res.render("registration", templateVars);
  }
});

app.get("/urls", (req, res) => {
  if (req.session["user_id"]) {
    const templateVars = {
      "user_id": users[req.session["user_id"]],
      urls: urlsForUser(req.session["user_id"], urlDatabase),
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send(`Please register or login.`);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session["user_id"]) {
    const templateVars = {
      "user_id": users[req.session["user_id"]],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect(`/login`);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(403).send(`This URL is invalid.`);

  } else if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
    const templateVars = {
      "user_id": users[req.session["user_id"]],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
    };
    res.render("urls_show", templateVars);

  } else {
    res.status(403).send(`Invalid for unauthorized users.`);
  }
});

app.get("/u/:shortURL", (req, res) => { // shortURL redirect to longURL
  if (!urlDatabase[req.params.shortURL]) { // check if shortURL valid
    res.status(403).send(`This URL is invalid.`);

  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

app.post("/login", (req, res) => {
  const userObj = getUserByEmail(req.body.email, users);

  if (!userObj) {
    res.status(403).send(`Invalid email.`);

  } else if (!bcrypt.compareSync(req.body.password, userObj.password)) {
    res.status(403).send(`Invalid credentials.`);

  } else {
    req.session["user_id"] = userObj.id;
    res.redirect(`/urls`);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  // Empty string in email or password field
  if (!req.body.email || !req.body.password) {
    res.status(400).send(`Please enter an email and password.`);

    // Existing email
  } else if (checkExisting(req.body.email, 'email', users) === true) {
    res.status(400).send(`This email is already registered.`);

  } else {
    let newUserId = generateRandomString();
    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt)
    };
    req.session["user_id"] = newUserId;
    res.redirect(`/urls`);
  }
});

app.post("/urls", (req, res) => { // Modify existing shortURL's longURL
  if (req.session["user_id"]) {
    const newShortURL = generateRandomString();
    urlDatabase[newShortURL] = {
      longURL: '',
      userID: '',
    };
    urlDatabase[newShortURL].longURL = req.body.longURL;
    urlDatabase[newShortURL].userID = req.session["user_id"];
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.status(403).send(`Invalid for unauthorized users.`);
  }
});

app.post("/urls/:shortURL", (req, res) => { // Create new shortURL
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
    res.redirect(`/urls`);
  } else {
    res.status(403).send(`Invalid for unauthorized users.`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(403).send(`Invalid for unauthorized users.`);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});