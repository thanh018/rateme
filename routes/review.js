var Company = require('../models/company');

module.exports = (app) => {
  app.get('/review/:id', (req, res) => {
    var msg = req.flash('success');
    Company.findOne({ _id: req.params.id })
      .then(data => {
        res.render('company/review', {
          title: 'Company review',
          user: req.user,
          data: data,
          msg: msg,
          hasMsg: msg.length > 0,
        })
      .catch(error => console.log('Error ', error));
    });
  });

  app.post('/review/:id', async(req, res) => {
    try {
      // FindOne with id and get this result then push = update with id and push
      const company = await Company.findById(req.params.id);
      await company.update(
        {
          $push: {
            companyRating: {
              companyName: req.body.sender,
              userFullname: req.user.fullname,
              userRole: req.user.role,
              companyImage: req.user.company.image,
              userRating: req.body.clickedValue,
              userReview: req.body.review,
            },
            ratingNumber: req.body.clickedValue,
          },
          $inc: { ratingSum: req.body.clickedValue },
          // The $inc operator increments a field by a specified value
          // ratingSum = ratingSum + req.body.clickedValue
        }
      )
        .then(comp => res.status(200).json({ company: comp }))
        .catch(error => console.log('Error ', error));
    } catch (error) {
      console.log('Error ', error);
    }

    /* Old version
      async.waterfall([
        function (callback) {
          Company.findOne({ _id: req.params.id }, (err, result) => {
            console.log("result", result)
            callback(err, result);
          });
        },

        function (result, callback) {
          Company.update(
            {
              _id: req.params.id,
            },
            {
              $push: {
                companyRating: {
                  companyName: req.body.sender,
                  userFullname: req.user.fullname,
                  userRole: req.user.role,
                  companyImage: req.user.company.image,
                  userRating: req.body.clickedValue,
                  userReview: req.body.review,
                },
                ratingNumber: req.body.clickedValue,
              },
              $inc: { ratingSum: req.body.clickedValue }, // The $inc operator increments a field by a specified value
              // ratingSum = ratingSum + req.body.clickedValue
            },
            err => {
              if (err) { console.log(err) };
              // req.flash('success', 'Your review has been added.');
              // res.redirect('/company-profile/' + req.params.id);
              res.status(200).json({ company: result });
            },
          );
        },
      ]);
    */
  });
};
