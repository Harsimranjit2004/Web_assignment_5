/********************************************************************************
 * WEB322 – Assignment 05
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Harsimranjit Singh Student ID: 155452220 Date: 17-Nov-2024
 *
 * Published URL: https://web-assignment-5.vercel.app
 *
 ********************************************************************************/

const express = require("express");
const clientSessions = require("client-sessions");
require("dotenv").config();
const legoData = require("./modules/legoSets");
const authData = require("./modules/auth-service");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3500;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

app.use(
  clientSessions({
    cookieName: "session",
    secret: "o6LjQ5EVNC28ZgK64hDELM18ScpFQr",
    duration: 24 * 60 * 60 * 5,
  })
);
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.get("/", (req, res) => {
  res.render("home", { page: "/" });
});
app.get("/about", (req, res) => {
  res.render("about", { page: "/about" });
});
app.get("/lego/sets", (req, res) => {
  const { theme } = req.query;
  if (theme) {
    legoData
      .getSetsByTheme(theme)
      .then((sets) => {
        if (sets.length === 0) {
          res.status(404).render("404", {
            page: "/lego/sets",
            message: `No sets found for theme: ${theme}`,
          });
        } else {
          res.render("sets", { page: "/lego/sets", sets: sets });
        }
      })
      .catch((err) =>
        res
          .status(404)
          .render("404", { page: "/lego/sets", message: err.message })
      );
  } else {
    legoData
      .getAllSets()
      .then((sets) => res.render("sets", { page: "/lego/sets", sets: sets }))
      .catch((err) =>
        res
          .status(404)
          .render("404", { page: "/lego/sets", message: err.message })
      );
  }
});
app.get("/lego/sets/:numId", (req, res) => {
  const { numId } = req.params;
  legoData
    .getSetByNum(numId)
    .then((set) => {
      if (!set) {
        res.status(404).render("404", {
          page: "/lego/sets",
          message: `No set found with ID: ${numId}`,
        });
      } else {
        res.render("set", { page: "/lego/sets", set: set });
      }
    })
    .catch((err) =>
      res
        .status(404)
        .render("404", { page: "/lego/sets", message: err.message })
    );
});
app.get("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render("addSet", { themes });
  } catch (err) {
    res.render("500", {
      message: `Error loading themes: ${err}`,
      page: "",
    });
  }
});

app.post("/lego/addSet", ensureLogin, async (req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `Error adding set: ${err}`, page: "" });
  }
});
app.get("/lego/editSet/:num", ensureLogin, async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.num);
    const themes = await legoData.getAllThemes();
    res.render("editSet", { set, themes });
  } catch (err) {
    res
      .status(404)
      .render("404", { message: `Set not found: ${err}`, page: "" });
  }
});
app.post("/lego/editSet", ensureLogin, async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `Error updating set: ${err}`, page: "" });
  }
});
app.get("/lego/deleteSet/:num", ensureLogin, async (req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (err) {
    res.render("500", { message: `Error deleting set: ${err}`, page: "" });
  }
});

app.get("/login", function (req, res) {
  res.render("login", {
    errorMessage: "",
  });
});

app.get("/register", function (req, res) {
  res.render("register", {
    errorMessage: "",
    successMessage: "",
  });
});

app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", {
        successMessage: "User created",
        errorMessage: null,
      });
    })
    .catch((err) => {
      res.render("register", {
        successMessage: null,
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/lego/sets");
    })
    .catch((err) =>
      res.render("login", { errorMessage: err, userName: req.body.userName })
    );
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", { user: req.session.user });
});

app.use((req, res) => {
  res.status(404).render("404", {
    message: "The page you're looking for doesn't exist.",
    page: "/404",
  });
});
legoData
  .initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => console.log(`Failed due to ${err}`));
