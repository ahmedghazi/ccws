// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PostSchema = new Schema({
	fbid: String,
  	name: String,
  	message: String,
  	description: String,
  	link: {
      	//unique: true,
      	index: true,
      	type: String
  	},
  	updated_time: {
      	index: true,
    	type: Date, default: Date.now
  	},
  	from: String,
    image: String
},{
    timestamps: true
});


mongoose.model('Post', PostSchema);

