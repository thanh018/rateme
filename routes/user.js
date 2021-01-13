var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');
var get = require('lodash/get');
var isEmpty = require('lodash/isEmpty');
var crypto = require('crypto');
var User = require('../models/user');
var Company = require('../models/company');
var secret = require('../secret/secret');
const sgMail = require('@sendgrid/mail');

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
      title: 'Request password reset',
      messages: errors,
      hasErrors: errors.length > 0,
      info: info,
      noErrors: info.length > 0,
    });
  });

  app.post('/forgot', (req, res, next) => {
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) return res.status(401).json({ message: 'This email is not associated with any account' });

        // Generate and set password reset token
        user.generatePasswordReset();

        // https://sendgrid.com/docs/for-developers/sending-email/quickstart-nodejs/
        SENDGRID_APY_KEY = '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';
        sgMail.setApiKey(SENDGRID_APY_KEY);

        // Save the update user object
        user.save()
          .then(user => {
            const mailOptions = {
              to: user.email,
              from: 'dtvan777@gmail.com',
              subject: 'Password change request',
              text: `Hi ${user.email}`,
            };
            sgMail.send(mailOptions, (error, result) => {
              if (error) return res.status(500).json({message: error.message});

              res.status(200).json({message: 'A reset email has been sent to ' + user.email + '.'});
            });
          })
          .catch(error => res.status(500).json({ message: error }));
      })
      .catch(error => res.status(500).json({ message: error }));
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
