var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  request = require('request'),
  schedule = require('node-schedule'),
  async = require('async'),
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
  FB.api('393558204075688/feed?limit=10&&fields=id,message,name,caption,description,updated_time,link,from,type', function (_res) {
    if(!_res || _res.error) {
     console.log(!_res ? 'error occurred' : _res.error);
     return res.send(_res.error);
    }
    //console.log(_res.id);
    //console.log(_res.name);
    
    record(res, _res);
  });
});

router.get('/feed', function (req, res, next) {
  var url = req.query.url+'&fields='+req.query.fields;
  return res.send(req.query)
  FB.setAccessToken('398286323958628|IrwxIREQmoqa0x8G2zTIj7AmzP8');
  FB.api(url, function (_res) {
    if(!_res || _res.error) {
     console.log(!_res ? 'error occurred' : _res.error);
     return res.send(_res.error);
    }
    //console.log(_res.id);
    //console.log(_res.name);
    
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
      var post = new Post();
          post.fbid = _post.id;
          post.type = _post.type;
          post.name = _post.name;
          post.message = _post.message;
          post.description = _post.description;
          post.updated_time = _post.updated_time;
          post.link = _post.link;
          post.from = _post.from.name;
      //console.log(post)
      
      post.save(function (err) {
        if (err) console.log(err);

        callback();
      });
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