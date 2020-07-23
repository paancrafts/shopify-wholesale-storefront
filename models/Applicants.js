const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Applicant = new Schema({
  storeName: { type: String },
  socialMediaHandles: { type: String },
  businessName: { type: String, required: true },
  licence: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  message: { type: String, required: true },
  activated: { type: Boolean, required: true },
  token: { type: String },
  confirmationDate: { type: String },
  uploadedFileName: { type: String },
  uploadedFilePath: { type: String },
  fileLoaded: { type: Boolean, required: true },
});

module.exports = mongoose.model('Applicant', Applicant);