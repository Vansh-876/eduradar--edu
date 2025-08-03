if(process.env.NODE_ENV != "production") {
require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const sampleListings = require("./init/data.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const listingsRoutes = require("./routes/listing.js");
const reviewsRoutes = require("./routes/review.js");
const UserRoutes = require("./routes/user.js");
const vendorRoutes = require('./routes/vendor.js');
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const homeController = require('./controllers/home.js');

const dbUrl = process.env.ATLASDB_URL;
// Set EJS view engine and middleware
app.set("view engine", "ejs");
app.set("views", (path.join(__dirname, "views")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use('/images', express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.locals.activePage = null;
  next();
});


async function main() {
  try {
    await mongoose.connect(dbUrl);
  console.log("Mongo URI:", process.env.ATLASDB_URL); // 👈 Add this above mongoose.connect()

    console.log("connected to db ✅");

    // Start server only after DB is connected and seeded
    app.listen(8080, () => {
      console.log("server is listening to port 8080 🚀");
    });

  } catch (err) {
    console.log("Error in DB connection ❌", err);
  }
}

main();

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", ()=>{
  console.log("error in mongo session store",err);
})
// Session configuration
const sessionConfig = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true
  }
};

// Session and Flash
app.use(session(sessionConfig));
app.use(flash());

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Locals middleware (must come after passport)
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use(async (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = await User.findById(req.user._id);
    res.locals.currentUser = user;
  } else {
    res.locals.currentUser = null;
  }
  next();
});

app.use((req, res, next) => {
  res.locals.search = req.query.search || "";
  res.locals.location = req.query.location || "";
  next();
});

app.get('/', homeController.homepage);
app.get("/about", (req, res) => {
  res.render("aboutus"); // file name is aboutus.ejs
});
app.get("/services", (req, res) => {
  res.render("services");
});

app.get('/features', (req, res) => {
  res.render('features');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});
app.get("/blog", (req, res) => {
  res.render("blog");
});
app.get("/faq", (req, res) => {
  res.render("faq");
});
app.get('/terms', (req, res) => {
  res.render('terms', { page: 'terms' });
});

app.get('/privacy', (req, res) => {
  res.render('privacy', { page: 'privacy' });
});

app.get('/copyright', (req, res) => {
  res.render('copyright', { page: 'copyright' });
});

app.use("/", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", UserRoutes);
app.use('/', vendorRoutes);


// 404 Error Handling
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).render("error", { err });
});