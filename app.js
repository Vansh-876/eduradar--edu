if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Models & Routes
const User = require("./models/user.js");
const Notification = require('./models/Notification.js');
const listingRoutes = require("./routes/listing.js");
const reviewsRoutes = require("./routes/review.js");
const UserRoutes = require("./routes/user.js");
const vendorRoutes = require('./routes/vendor.js');
const bookmarkRoutes = require("./routes/bookmark.js");
const notificationRoutes = require('./routes/notifications');
const homeController = require('./controllers/home.js');

// Socket utility
const socketUtil = require('./utils/socket');

const dbUrl = process.env.ATLASDB_URL;

// Socket.io init
const io = socketUtil.init(server);
app.set('io', io);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to MongoDB and start server
async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("MongoDB connected ✅");

    server.listen(8080, () => {
      console.log("Server listening on port 8080 🚀");
    });
  } catch (err) {
    console.error("Error connecting to DB:", err);
  }
}
main();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Body parsing & method override
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, "/public")));
app.use('/images', express.static(path.join(__dirname, "images")));

// Session store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});
store.on("error", (err) => {
  console.error("Session store error:", err);
});

// Session config
const sessionConfig = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  }
};
app.use(session(sessionConfig));
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global locals middleware (must be before routes)
app.use(async (req, res, next) => {
  // currentUser
  if (req.user) {
    const user = await User.findById(req.user._id).populate("bookmarks");
    res.locals.currentUser = user;
  } else {
    res.locals.currentUser = null;
  }

  // flash messages
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  // search & location (optional)
  res.locals.search = req.query.search || "";
  res.locals.location = req.query.location || "";

  // notification middleware
  if (req.user) {
    try {
      const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
      const recent = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      res.locals.notificationCount = unreadCount;
      res.locals.recentNotifications = recent;
    } catch (err) {
      console.error('Notification middleware error:', err);
      res.locals.notificationCount = 0;
      res.locals.recentNotifications = [];
    }
  } else {
    res.locals.notificationCount = 0;
    res.locals.recentNotifications = [];
  }

  next();
});

// Active page middleware
app.use((req, res, next) => {
  res.locals.activePage = null; // will override per route
  next();
});

// Routes
app.use("/", listingRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", UserRoutes);
app.use('/', vendorRoutes);
app.use("/", bookmarkRoutes);
app.use('/notifications', notificationRoutes);

// Static pages / other routes
app.get("/", (req, res) => {
  res.locals.activePage = 'home';
  res.render("home");
});
app.get("/listings", (req, res) => {
  res.locals.activePage = 'listings';
  res.render("listings");
});
app.get("/about", (req, res) => res.render("aboutus"));
app.get("/services", (req, res) => res.render("services"));
app.get("/features", (req, res) => res.render("features"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/blog", (req, res) => res.render("blog"));
app.get("/faq", (req, res) => res.render("faq"));
app.get("/terms", (req, res) => res.render("terms", { page: 'terms' }));
app.get("/privacy", (req, res) => res.render("privacy", { page: 'privacy' }));
app.get("/copyright", (req, res) => res.render("copyright", { page: 'copyright' }));

// 404 / error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).render("error", { err });
});

module.exports = app;
