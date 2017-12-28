var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  postsPerPage;

module.exports = function (app) {
  postsPerPage = 100;
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  return Post
      .find()
      .sort({updated_time: 'desc'})
      .limit(postsPerPage)
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

router.get('/page/:id', function (req, res, next) {
  var skip = parseInt(req.params.id * postsPerPage);
  return Post
      .find()
      .sort({updated_time: 'desc'})
      .limit(postsPerPage)
      .skip(skip)
      .exec(function(err, posts) {
        if (err) {
            console.log(err);
            return next(err);
        }
        //console.log(app.get('title'));
        return res.render('liste', {
          //title: 'Crazy cool websites Archive',
          posts: posts
        });
  });
  
});

router.get('/all', function (req, res, next) {
  return Post
      .find()
      .sort({updated_time: 'desc'})
      //.limit(postsPerPage)
      .exec(function(err, posts) {
      if (err) {
          console.log(err);
          return next(err);
      }
      //console.log(app.get('title'));
      return res.json(posts);
  });
});