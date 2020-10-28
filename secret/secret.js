module.exports = {
  auth: {
    user: "lookat018@gmail.com",
    pass: "",
  },

  facebook: {
    clientID: "1025637444527316", //Facebook login app id
    clientSecret: "eeac427ef223bbba2321686f3d97462a", //Facebook login secret key
    profileFields: ["email", "displayName"],
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    passReqToCallback: true,
  },
};
