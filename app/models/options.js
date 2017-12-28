// Example model

var mongoose = require('mongoose'),
  	Schema = mongoose.Schema;

var OptionsSchema = new Schema({
    meta: {
        key: String,
        value: String
      }
},{
    timestamps: true
});

mongoose.model('Options', OptionsSchema);