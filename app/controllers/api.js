var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  request = require('request'),
  async = require('async'),
  extract = require('meta-extractor'),
  helpers = require('../lib/helpers'),
  webshot = require('node-webshot'),
  slug = require('slug'),
  FB = require('fb'),
  color   = require('dominant-color'),
  fbApp,
  client_id,
  client_secret,
  app;

module.exports = function (_app) {
  client_id = '398286323958628';
  client_secret = '926f16496c7e71988cd8a827c9ea0ba0';
  fbApp = FB.extend({appId: client_id, appSecret: client_secret});

  app = _app;
  app.use('/api', router);
};

router.get('/', function (req, res, next) {
  res.send("api")
});

router.get('/oauth', function (req, res, next) {
  FB.api('oauth/access_token', {
      client_id: client_id,
      client_secret: client_secret,
      grant_type: 'client_credentials'
  }, function (_res) {
      if(!_res || _res.error) {
          console.log(!_res ? 'error occurred' : _res.error);
          return;
      }

      var accessToken = _res.access_token;
      console.log(accessToken)
      //398286323958628|IrwxIREQmoqa0x8G2zTIj7AmzP8
      return res.send(accessToken)
  });
});

router.get('/slug', function (req, res, next) {
  Post
    .find()
    .sort({updated_time: 'desc'})
    .limit(30)
    .exec(function(err, posts) {
      var _slug = "";
      if(post.name)
          _slug = slug(post.name);
      else 
          _slug = Math.random().toString(36).substring(7);

      console.log(post.name)
      console.log(_slug)
    });
});

router.get('/shot/:id', function (req, res, next) {
  var postsPerPage = 10;
  var skip = parseInt(req.params.id * postsPerPage);
    Post
      .find()
      .sort({updated_time: 'desc'})
      .limit(postsPerPage)
      .skip(skip)
      .exec(function(err, posts) {
        //res.send("processing")
        async.each(posts,
          function(post, callback){
            
            var _slug = "";
            if(post.name)
                _slug = slug(post.name).toLowerCase();
            else 
                _slug = Math.random().toString(36).substring(7);
            
            //console.log(_slug)

            var screenshot = "public/uploads/crazy-cool-websites-"+_slug+".png";
            
            webshot(post.link, screenshot, function(err) {
              if(!err){
            
                screenshot = screenshot.replace("public/", "");
            
                var query = {_id: post._id}
                var update = {image: screenshot}
                console.log(screenshot);
             
                Post.findOneAndUpdate(query, update, {upsert: true, 'new': true}, function (err, post, raw) {
                  callback();
                });
              
              }else{
                console.log(err)
                callback();
              }
              
            });
          },
          function(err){
            var nextPage = parseFloat(req.params.id) + 1;
            res.redirect("/api/shot/"+nextPage);
          });
      });
  //});
});

router.get('/last', function (req, res, next) {
  Post
    .find()
    .limit(10)
    .sort({"updated_time": -1})
    //.limit(postsPerPage)
    .exec(function(err, posts) {
    if (err) {
        console.log(err);
        return next(err);
    }
    var last = posts[0];
    var time = new Date(last.updated_time);
    var unix = Math.round(time/1000)
    //return res.json(unix)
    Options.findOneAndUpdate(
        {'meta.key': 'first_post_timestamp'}, 
        {'meta.value': unix}, 
        {upsert: true, 'new': false}, 
        function (err, options, raw) {
        if (err) {
            return console.log(err);
        } 

        //callback(err, {success:true});
    });

  });
  
});

router.get('/posts', function (req, res, next) {
  helpers.set_root_url(app.locals.root_url)
  helpers.init_timestamp(function(time){
      helpers.collect(time, function(){
          console.log("collect callback")
      });
  });
});

router.get('/count', function (req, res, next) {
  helpers.set_total();
});

router.get('/posts-all', function (req, res, next) {
  FB.setAccessToken('398286323958628|IrwxIREQmoqa0x8G2zTIj7AmzP8');
  FB.api('393558204075688/feed?limit=100&&fields=id,message,name,caption,description,updated_time,link,from,type', function (_res) {
    if(!_res || _res.error) {
     console.log(!_res ? 'error occurred' : _res.error);
     return res.send(_res.error);
    }
    
    record(res, _res);
  });
});


function record(res, _res){
  if(!_res || _res.error) {
   console.log(!_res ? 'error occurred' : _res.error);
   return res.send(_res.error);
  }
  console.log("length",_res.data.length)

  async.each(_res.data,
    function(_post, callback){
      
      //console.log(post)
      if(_post.link){
        var query = {link: _post.link}
        var update = {
            fbid: _post.id,
            type: _post.type,
            name: _post.name,
            message: _post.message,
            description: _post.description,
            updated_time: _post.updated_time,
            link: _post.link,
            from: _post.from.name
        }

        Post.findOneAndUpdate(query, update, {upsert: true, 'new': true}, function (err, post, raw) {
          //callback();
          extract({ uri: post.link }, function (error, results) {
            if(!error){              
              var image = '';
              if(results.ogImage)
                image = results.ogImage;
              else if(results.twitterImage){
                image = results.twitterImage;
              }

              var query = {_id: post._id}
              var update = {image: image}
              console.log(image);
           
              Post.findOneAndUpdate(query, update, {upsert: true, 'new': true}, function (err, post, raw) {
                callback();
              });
            
            }else{
              callback();
            }
            
          });
        });

      }else{
        callback();
      }
      
    },
    
    function(err){
      
      if (_res.paging && _res.paging.next != "undefined"){
        console.log("paging",_res.paging.next)
        var options = { 
            method: 'GET',
            url: _res.paging.next,
        };
        
        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log("statusCode",response.statusCode);
            //console.log(body);

            record(res, JSON.parse(body))
        }).setMaxListeners(0);

      }else{
        //res.redirect("/posts")
        res.send("done")
      }
    }
  );
}


router.get('/image', function (req, res, next) {
  Post
    .find()
    .sort({updated_time: 'desc'})
    //.limit(10)
    .exec(function(err, posts) {
      async.each(posts,
        function(post, callback){
          extract({ uri: post.link }, function (error, results) {
          
            if(!error){              
              var image = '';
              if(results.ogImage)
                image = results.ogImage;
              else if(results.twitterImage){
                image = results.twitterImage;
              }

              var query = {_id: post._id}
              var update = {image: image}
              console.log(image);
           
              Post.findOneAndUpdate(query, update, {upsert: true, 'new': true}, function (err, post, raw) {
                callback();
              });
            
            }else{
              callback();
            }
            
          });
        },
        function(err){
          res.send("done")
        });
    });
});

router.get('/color', function (req, res, next) {
  Post
    .find()
    //.limit(req.params.limit)
    .sort({updated_time: 'desc'})
    .exec(function(err, posts) {
      async.each(posts,
        function(post, callback){
          if(post.image){
            color(app.locals.root_url+"/"+post.image, function(err, color){
              if(err){
                console.log("err",err)
                callback();
              }else{
                var query = {_id: post._id}
                var update = {color: color}
                console.log("color",color);
                
                Post.findOneAndUpdate(query, update, {upsert: true, 'new': true}, function (err, post, raw) {
                  callback();
                });
              }
            });
          }else{
            callback();
          }
          
        },
        function(err){
          res.send("done")
        });
    });
});

router.get('/image-n-color/:id', function (req, res, next) {
  Post
    .findOne({_id: req.params.id})
    .exec(function(err, post) {
    if (err) {
        console.log(err);
        return next(err);
    }
    if(!post.color){
      if(post.name)
          _slug = slug(post.name).toLowerCase();
      else 
          _slug = Math.random().toString(36).substring(7);
      
      console.log("slug",_slug)

      var screenshot = "public/uploads/crazy-cool-websites-"+_slug+".png";
      console.log(app.locals.root_url+"/"+screenshot)
      webshot(post.link, screenshot, {renderDelay: 2000}, function(error) {
        if(!error){       
      
            screenshot = screenshot.replace("public/", "");
      
            var query = {_id: post._id}
            color(app.locals.root_url+"/"+screenshot, function(err, color){
                if(err){
                    console.log("color err",err)
                    var update = {image: screenshot}
                    Post.findOneAndUpdate(query, update, {upsert: true, 'new': true}, function (err, post, raw) {
                        return res.json(post)
                    });
                }else{
                    var update = {
                        image: screenshot,
                        color: color
                    }

                    console.log("- screenshot", screenshot);
                    console.log("- color",color);
                  
                    Post.findOneAndUpdate(query, update, {upsert: true, 'new': true}, function (err, post, raw) {
                        return res.json(post)
                    });
                }
            
            });
        }else{
          console.log("webshot error",error)
          return res.json(post)
        }
      });
    }else{
      return res.json(post)
    }
    /*
    Options.findOneAndUpdate(
        {'meta.key': 'first_post_timestamp'}, 
        {'meta.value': unix}, 
        {upsert: true, 'new': false}, 
        function (err, options, raw) {
        if (err) {
            return console.log(err);
        } 

        //callback(err, {success:true});
    });*/

  });
  
});

router.get('/drop', function (req, res, next) {
  req.resetDb();
  res.redirect("/");
});