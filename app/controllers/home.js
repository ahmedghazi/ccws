var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  Options = mongoose.model('Options'),
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
     
      Options
        .findOne({'meta.key': 'total_posts'})
        .exec(function(err, option) {
          console.log(option.meta)
          return res.render('index', {
            title: 'Crazy cool websites Archive',
            posts: posts,
            total_posts: option.meta.value
          });
        });
      //console.log(app.get('title'));
      
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