const { Schema, model } = require('mongoose');

const schema = new Schema({
  name: { type: String, required: true },
  day: { type: Number, required: true },
  month: { type: Number, required: true }
});

module.exports = model('User', schema);
