var formidable = require('formidable');
var path = require('path');
var multer = require('multer');
var fs = require('fs');
var async = require('async');
const upload = require('../config/uploadMiddleware');
const Resize = require('../config/Resize');

var Company = require('../models/company');
var User = require('../models/user');

var { arrayAverage } = require('../utils/utils');

module.exports = (app) => {
  app.get('/company/create', (req, res) => {
    var success = req.flash('success');
    res.render('company/company', {
      title: 'Company Registration',
      user: req.user,
      success: success,
      noErrors: success.length > 0,
    });
  });

  app.post('/company/create', (req, res) => {
    const { body } = req;
    const {
      name,
      address,
      city,
      country,
      sector,
      website,
      image
    } = body;
    const company = new Company({
      name,
      address,
      city,
      country,
      sector,
      website,
      image
    });

    company.save()
      .then(() => {
        // req.flash('success', 'Company data has been added.');
        res.status(200).json(company);
      })
      .catch(err => res.status(400).json(`Error: ${err}`));
  });

  app.post('/upload', upload.single('image'), async (req, res) => {
    // folder upload
    const imagePath = path.join(__dirname, '../public/uploads');

    // call class Resize
    const fileUpload = new Resize(imagePath);

    if (!req.file) {
      res.status(401).json({ error: 'Please provide an image' });
    }
    const filename = await fileUpload.save(req.file.buffer);
    return res.status(200).json({ name: filename });
  });

  app.get('/companies', (req, res) => {
    Company.find({}, (err, result) => {
      
      res.render('company/companies', {
        title: 'All Companies || RateMe',
        user: req.user,
        data: result,
      });
    });
  });

  app.get('/company-profile/:id', (req, res) => {
    Company.findOne({ _id: req.params.id }, (err, data) => {
      var avg = arrayAverage(data.ratingNumber);
      console.log(avg);
      res.render('company/company-profile', {
        title: 'Company Name',
        user: req.user,
        id: req.params.id,
        data: data,
        average: avg,
      });
    });
  });

  app.get('/company/register-employee/:id', (req, res) => {
    Company.findOne({ _id: req.params.id }, (err, data) => {
      res.render('company/register-employee', {
        title: 'Register Employee',
        user: req.user,
        data: data,
      });
    });
  });

  app.post('/company/register-employee/:id', (req, res, next) => {
    async.parallel([
      function (callback) {
        // update employee for company
        Company.update(
          {
            _id: req.params.id,
            'employees.employeeId': { $ne: req.user._id }, // find a company that user has not registered yet
          },
          {
            $push: {
              employees: {
                employeeId: req.user._id,
                employeeFullname: req.user.fullname,
                employeeRole: req.body.role,
              },
            },
          },
          (err, count) => {
            if (err) {
              return next(err);
            }
            callback(err, count);
          },
        );
      },

      function (callback) {
        // update company (name and image) for user
        async.waterfall([
          function (callback) {
            Company.findOne({ _id: req.params.id }, (err, data) => {
              callback(err, data);
            });
          },

          function (data, callback) {
            User.findOne({ _id: req.user._id }, (err, result) => {
              result.role = req.body.role;
              result.company.name = data.name;
              result.company.image = data.image;

              result.save(() => {
                res.redirect('/home');
              });
            });
          },
        ]);
      },
    ]);
  });

  app.get('/:name/employees', (req, res) => {
    Company.findOne({ name: req.params.name }, (err, data) => {
      res.render('company/employees', {
        title: 'Company EMployees',
        user: req.user,
        data: data,
      });
    });
  });

  app.get('/companies/leaderboard', (req, res) => {
    Company.find({}, (err, result) => {
      res.render('company/leaderboard', {
        title: 'Companies Leadebaord',
        user: req.user,
        data: result,
      });
    }).sort({ ratingSum: -1 });
  });

  app.get('/company/search', (req, res) => {
    res.render('company/search', { title: 'Find a Company', user: req.user });
  });

  app.post('/company/search', (req, res) => {
    var name = req.body.search;
    var regex = new RegExp(name, 'i');

    Company.find({ $or: [{ name: regex }] }, (err, data) => {
      if (err) {
        console.log(err);
      }
      // console.log(data);
      // console.log('data[0] ',data[0]);
      res.redirect('/company-profile/' + data[0]._id);
    });
  });
};
