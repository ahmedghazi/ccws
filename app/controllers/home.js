var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  Options = mongoose.model('Options'),
  postsPerPage;

module.exports = function (app) {
  postsPerPage = 30;
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
		  //console.log(option.meta)
		  return res.render('index', {
			title: 'CRAZY COOL WEBSITES Archive',
			posts: posts,
			total_posts: option.meta.value
		  });
		});
	  //console.log(app.get('title'));
	  
  });
});

router.get('/images', function (req, res, next) {
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
		  //console.log(option.meta)
		  return res.render('images', {
			title: 'CRAZY COOL WEBSITES Archive',
			posts: posts,
			total_posts: option.meta.value
		  });
		});
	  //console.log(app.get('title'));
	  
  });
});

router.get('/images/page/:id', function (req, res, next) {
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
		return res.render('liste-images', {
		  //title: 'CRAZY COOL WEBSITES Archive',
		  posts: posts
		});
  });
  
});

router.get('/contributors', function (req, res, next) {
  return Post
	  .find()
	  //.sort({updated_time: 'desc'})
	  //.limit(postsPerPage)
	  .exec(function(err, posts) {
	  if (err) {
		  console.log(err);
		  return next(err);
	  }
	  var tmp = [];
	  for (var i = 0, len = posts.length; i < len; i++) {
		tmp.push(posts[i].from);
	  }
	  var contributors = Array.from(new Set(tmp))
	  contributors.sort();
	  return res.render('contributors', {
		title: 'CRAZY COOL WEBSITES Archive',
		contributors: contributors,
		total_posts: contributors.length
	  });
	  
  });
});

router.get('/about', function (req, res, next) {
  return res.render('about', {
	title: 'CRAZY COOL WEBSITES Archive'
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
		  //title: 'CRAZY COOL WEBSITES Archive',
		  posts: posts
		});
  });
  
});

router.get('/random', function (req, res, next) {
  //var skip = parseInt(req.params.id * postsPerPage);
  return Post
	  .aggregate([
		{ $sample: { size: postsPerPage } }
	  ])
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
			  title: 'CRAZY COOL WEBSITES Archive',
			  posts: posts,
			  total_posts: option.meta.value
			});
		  });
  });
  
});

router.get('/random/page/:id', function (req, res, next) {
  //var skip = parseInt(req.params.id * postsPerPage);
  return Post
	  .aggregate([
		{ $sample: { size: postsPerPage } }
	  ])
	  .exec(function(err, posts) {
		if (err) {
			console.log(err);
			return next(err);
		}
		//console.log(app.get('title'));
		return res.render('liste', {
		  title: 'CRAZY COOL WEBSITES Archive',
		  posts: posts
		});
  });
  
});

router.get('/search', function (req, res, next) {
  return res.render('search', {
	title: 'CRAZY COOL WEBSITES Archive'
  });
  
});

router.get('/search/:term', function (req, res, next) {
  console.log(req.params.term)
  return Post
	  .find({
		"$or": [
		  { name : { $regex: req.params.term, $options: 'i' }},
		  { link : { $regex: req.params.term, $options: 'i' }},
		  { from : { $regex: req.params.term, $options: 'i' }}
		]
	  })
	  .sort({updated_time: 'desc'})
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
			title: 'CRAZY COOL WEBSITES Archive',
			posts: posts,
			total_posts: posts.length
		  });
		});
	  //console.log(app.get('title'));
	  
  });
  
});

router.get('/s/:term', function (req, res, next) {
  //var skip = parseInt(req.params.id * postsPerPage);
  return Post
	  .find({
		"$or": [
		  { name : { $regex: req.params.term, $options: 'i' }},
		  { link : { $regex: req.params.term, $options: 'i' }},
		  { from : { $regex: req.params.term, $options: 'i' }}
		]
	  })
	  .sort({updated_time: 'desc'})
	  .exec(function(err, posts) {
		if (err) {
			console.log(err);
			return next(err);
		}
		//console.log(app.get('title'));
		return res.render('liste', {
		  title: 'CRAZY COOL WEBSITES Archive',
		  posts: posts
		});
  });
  
});

router.get('/pull', function (req, res, next) {
  return res.render('pull', {
	title: 'pull',
  });
});

