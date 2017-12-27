var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  return Post
      .find()
      .sort({updated_time: 'desc'})
      
      .exec(function(err, posts) {
      if (err) {
          console.log(err);
          return next(err);
      }
      //console.log(app.get('title'));
      return res.render('index', {
        title: 'Crazy cool websites Archive',
        posts: posts
      });
  });
});

