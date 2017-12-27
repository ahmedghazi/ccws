var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  request = require('request'),
  schedule = require('node-schedule'),
  async = require('async'),
  extract = require('meta-extractor'),
  FB = require('fb'),
  fbApp,
  client_id,
  client_secret;

module.exports = function (app) {
  client_id = '398286323958628';
  client_secret = '926f16496c7e71988cd8a827c9ea0ba0';
  fbApp = FB.extend({appId: client_id, appSecret: client_secret});
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


router.get('/posts', function (req, res, next) {
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
          callback();
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
          //ogs({url: post.link}, function (error, results) {
            //console.log('error:', error); // This is returns true or false. True if there was a error. The error it self is inside the results object.
            if(!error){
              //console.log('results:', results);
              
              var image = '';
              if(results.ogImage)
                image = results.ogImage;
              else if(results.twitterImage){
                image = results.twitterImage;
                //console.log('results:', results.data);
              }

              var query = {_id: post._id}
              var update = {image: image}
              console.log(image);
              //callback();
           
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

router.get('/drop', function (req, res, next) {
  req.resetDb();
  res.redirect("/");
});