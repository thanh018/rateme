var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require('../secret/secret');
const {
  USER_EXIST,
  INCORRECT_EMAIL,
  INCORRECT_PASSWORD,
  EMAIL_REQUIRED,
  PASSWORD_REQUIRED,
  INVALID_EMAIL,
  PASSWORD_ERROR,
  FULLNAME_ERROR,
} = require('../constants/common');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));

passport.use(
  'local.signup',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      req.checkBody('fullname', FULLNAME_ERROR).isLength({ min: 5 });
      req.checkBody('email', INVALID_EMAIL).isEmail();
      req.checkBody('password', PASSWORD_ERROR).isLength({ min: 6, max: 20 });

      const errors = req.validationErrors();
      console.log("errors", errors)

      if (errors) {
        let messages = [];
        errors.forEach(err => messages.push(err.msg));
        // req.flash('error', messages); // for API get
        return done(messages);
      }

      User.findOne({ email: email }, (err, user) => {
        if (err) done(err);

        if (user) return done(null, false, USER_EXIST);

        var newUser = new User();
        newUser.fullname = req.body.fullname;
        newUser.email = req.body.email;
        newUser.password = newUser.encryptPassword(req.body.password);

        newUser.save((err) => done(null, newUser));
      });
    },
  ),
);

passport.use(
  'local.login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      req.checkBody('email', EMAIL_REQUIRED).notEmpty();
      req.checkBody('password', PASSWORD_REQUIRED).notEmpty();
      req.checkBody('email', INVALID_EMAIL).isEmail();
      req.checkBody('password', PASSWORD_ERROR).isLength({ min: 6, max: 20 });

      const errors = req.validationErrors();

      if (errors) {
        let messages = [];
        errors.forEach(err => messages.push(err.msg));
        // req.flash('error', messages); // for API get
        return done(messages);
      }
      User.findOne({ email: email }, (err, user) => {
        if (err) return done(err);

        if (!user) return done(null, false, INCORRECT_EMAIL);

        if (!user.validPassword(password)) return done(null, false, INCORRECT_PASSWORD);

        return done(null, user);
      });
    },
  ),
);

passport.use(
  new FacebookStrategy(
    secret.facebook,
    (req, token, refreshToken, profile, done) => {
      User.findOne({ facebook: profile.id }, (err, user) => {
        if (err) return done(err);

        if (user) done(null, user);
        else {
          var newUser = new User();
          newUser.facebook = profile.id;
          newUser.fullname = profile.displayName;
          newUser.email = profile._json.email;
          newUser.tokens.push({ token: token });

          newUser.save(function (err) {
            if (err) console.log(err);
            done(null, newUser);
          });
        }
      });
    },
  ),
);
