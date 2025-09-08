
module.exports.homepage = (req, res) => {
  res.render("home", {
    activePage: "home",
    currentUser: req.user,
    notificationCount: 0, // or fetch from DB if needed
    recentNotifications: []
  });
};
