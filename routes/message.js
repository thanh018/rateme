var User = require('../models/user');
var Message = require('../models/message');

var async = require('async');

module.exports = (app) => {
  app.get('/message/:id', (req, res) => {
    async.parallel(
      [
        function (callback) {
          User.findById({ _id: req.params.id }, (err, currentUser) => {
            callback(err, currentUser);
          });
        },

        function (callback) {
          Message.find(
            {
              $or: [
                { userFrom: req.user._id, userTo: req.params.id },
                { userFrom: req.params.id, userTo: req.user._id },
              ],
            },
            (err, messages) => {
              callback(err, messages);
            },
          );
        },
      ],

      function (error, [currentUser, messages]) {
        if (error) console.log('Error ', error);

        res.render('messages/message', {
          title: 'Private message',
          user: req.user,
          data: currentUser,
          chats: messages,
        });
      },
    );
  });

  app.post('/message/:id', (req, res) => {
    User.findOne({ _id: req.params.id }, (err, data) => {
      var newMessage = new Message();
      newMessage.userFrom = req.user._id;
      newMessage.userTo = req.params.id;
      newMessage.userFromName = req.user.fullname;
      newMessage.userToName = data.fullname;
      newMessage.body = req.body.message;
      newMessage.createdAt = new Date();

      newMessage.save((error) => {
        if (error) console.log('Error ', error);
        res.redirect('/message/' + req.params.id);
      });
    });
  });
};
