var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');
var get = require('lodash/get');
var isEmpty = require('lodash/isEmpty');
var crypto = require('crypto');
var User = require('../models/user');
var Company = require('../models/company');
var secret = require('../secret/secret');

module.exports = (app, passport) => {
  app.get('/', (req, res) => {
    const user = get(req, 'user', {});
    if (!isEmpty(user)) res.redirect('/home');
    else res.redirect('/login');
  });

  app.get('/signup', (req, res) => {
    const user = get(req, 'user', {});
    if (!isEmpty(user)) res.redirect('/home');
    else {
      const errors = req.flash('error');
      res.render('user/signup', {
        title: 'Sign up',
        messages: errors,
        hasErrors: errors.length > 0,
      });
    }
  });

  app.get('/login', (req, res) => {
    const user = get(req, 'user', {});
    if (!isEmpty(user)) res.redirect('/home');
    else {
      var errors = req.flash('error');
      res.render('user/login', {
        title: 'Login',
        messages: errors,
        hasErrors: errors.length > 0,
      });
    }
  });

  app.post('/signup', function(req, res, next) {
    passport.authenticate('local.signup', function(err, user, message) {
      if (err) return res.status(400).json({ success: false, message: err });

      if (message) return res.status(401).json({ success: false, message });

      if (!user) { return res.redirect('/signup'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.status(200).json({ success: true, user });
      });
    })(req, res, next);
  });

  app.post('/login', function(req, res, next) {
    passport.authenticate('local.login', function(err, user, message) {
      if (err) return res.status(400).json({ success: false, message: err });

      if (message) return res.status(401).json({ success: false, message });

      if (!user) { return res.redirect('/login'); }

      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.status(200).json({ success: true, user });
      });
    })(req, res, next);
  });

  app.get(
    '/auth/facebook',
    passport.authenticate('facebook', { scope: 'email' }),
  );

  app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/home',
      failureRedirect: '/login',
      failureFlash: true,
    }),
  );

  app.get('/home', (req, res) =>
    res.render('home', { title: 'Home', user: req.user }),
  );

  app.get('/user/profile', (req, res) =>
    res.render('user/user-profile', { title: 'User profile', user: req.user }),
  );

  app.post('/user/profile', (req, res) => {
    User.findOne({ _id: req.user._id }, (err, result) => {
      if (err) res.status(400).json({ error: err })
      result.avatar = req.body.avatar;
      result.save(() => res.status(200).json({ user: result }));
    });
  });

  app.get('/forgot', (req, res) => {
    var errors = req.flash('error');
    var info = req.flash('info');
    res.render('user/forgot', {
      title: 'Request Password Reset',
      messages: errors,
      hasErrors: errors.length > 0,
      info: info,
      noErrors: info.length > 0,
    });
  });

  app.post('/forgot', (req, res, next) => {
    async.waterfall(
      [
        function (callback) {
          crypto.randomBytes(20, (err, buf) => {
            var rand = buf.toString('hex');
            callback(err, rand);
          });
        },

        function (rand, callback) {
          User.findOne({ email: req.body.email }, (err, user) => {
            if (!user) {
              req.flash(
                'error',
                'No account with that email exist or email is invalid',
              );
              return res.redirect('/forgot');
            }

            user.passwordResetToken = rand;
            user.passwordResetExpires = Date.now() + 60 * 60 * 1000;

            user.save((err) => {
              callback(err, rand, user);
            });
          });
        },

        function (rand, user, callback) {
          var smtpTransport = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
              user: secret.auth.user,
              pass: secret.auth.pass,
            },
          });

          var mailOptions = {
            to: user.email,
            from: 'RateMe ' + '<' + secret.auth.user + '>',
            subject: 'RateMe Application Password Reset Token',
            text:
              'You have requested for password reset token. \n\n' +
              'Please click on the link to complete the process: \n\n' +
              'http://localhost:5001/reset/' +
              rand +
              '\n\n',
          };

          smtpTransport.sendMail(mailOptions, (err, response) => {
            req.flash(
              'info',
              'A password reset token has been sent to ' + user.email,
            );
            return callback(err, user);
          });
        },
      ],
      (err) => {
        if (err) return next(err);
        res.redirect('/forgot');
      },
    );
  });

  app.get('/reset/:token', (req, res) => {
    User.findOne(
      {
        passwordResetToken: req.params.token,
        passwordResetExpires: { $gt: Date.now() },
      },
      (err, user) => {
        if (!user) {
          req.flash(
            'error',
            'Password reset token has expired or is invalid. Enter your email to get a new token.',
          );
          return res.redirect('/forgot');
        }
        var errors = req.flash('error');
        var success = req.flash('success');

        res.render('user/reset', {
          title: 'Reset Your Password',
          messages: errors,
          hasErrors: errors.length > 0,
          success: success,
          noErrors: success.length > 0,
        });
      },
    );
  });

  app.post('/reset/:token', (req, res) => {
    async.waterfall([
      function (callback) {
        User.findOne(
          {
            passwordResetToken: req.params.token,
            passwordResetExpires: { $gt: Date.now() },
          },
          (err, user) => {
            if (!user) {
              req.flash(
                'error',
                'Password reset token has expired or is invalid. Enter your email to get a new token.',
              );
              return res.redirect('/forgot');
            }

            req.checkBody('password', 'Password is Required').notEmpty();
            req
              .checkBody('password', 'Password Must Not Be Less Than 5')
              .isLength({ min: 5 });
            req
              .check('password', 'Password Must Contain at least 1 Number.')
              .matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, 'i');

            var errors = req.validationErrors();

            if (req.body.password == req.body.cpassword) {
              if (errors) {
                var messages = [];
                errors.forEach((error) => {
                  messages.push(error.msg);
                });

                var errors = req.flash('error');
                res.redirect('/reset/' + req.params.token);
              } else {
                user.password = user.encryptPassword(req.body.password);
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;

                user.save((err) => {
                  req.flash(
                    'success',
                    'Your password has been successfully updated.',
                  );
                  callback(err, user);
                });
              }
            } else {
              req.flash(
                'error',
                'Password and confirm password are not equal.',
              );
              res.redirect('/reset/' + req.params.token);
            }
          },
        );
      },

      function (user, callback) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: secret.auth.user,
            pass: secret.auth.pass,
          },
        });

        var mailOptions = {
          to: user.email,
          from: 'RateMe ' + '<' + secret.auth.user + '>',
          subject: 'Your password Has Been Updated.',
          text:
            'This is a confirmation that you updated the password for ' +
            user.email,
        };

        smtpTransport.sendMail(mailOptions, (err, response) => {
          callback(err, user);
          var error = req.flash('error');
          var success = req.flash('success');
          res.render('user/reset', {
            title: 'Reset Your Password',
            messages: error,
            hasErrors: error.length > 0,
            success: success,
            noErrors: success.length > 0,
          });
        });
      },
    ]);
  });

  app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy((err) => {
      res.redirect('/');
    });
  });
};

function validate(req, res, next) {
  req.checkBody('fullname', 'Fullname is Required').notEmpty();
  req
    .checkBody('fullname', 'Fullname Must Not Be Less Than 5')
    .isLength({ min: 5 });
  req.checkBody('email', 'Email is Required').notEmpty();
  req.checkBody('email', 'Email is Invalid').isEmail();
  req.checkBody('password', 'Password is Required').notEmpty();
  req
    .checkBody('password', 'Password Must Not Be Less Than 5')
    .isLength({ min: 5 });
  //  req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

  var errors = req.validationErrors();

  if (errors) {
    var messages = [];
    errors.forEach((error) => {
      messages.push(error.msg);
    });

    req.flash('error', messages);
    res.redirect('/signup');
  } else return next();
}

function loginValidation(req, res, next) {
  req.checkBody('email', 'Email is Required').notEmpty();
  req.checkBody('email', 'Email is Invalid').isEmail();
  req.checkBody('password', 'Password is Required').notEmpty();
  req
    .checkBody('password', 'Password Must Not Be Less Than 5 Characters')
    .isLength({ min: 5 });
  //  req.check("password", "Password Must Contain at least 1 Number.").matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");

  let loginErrors = req.validationErrors();

  if (loginErrors.length > 0) {
    let messages = [];
    loginErrors.forEach(error => messages.push(error.msg));
    req.flash('error', messages);
    res.redirect('/login');
  } else return next();
}
