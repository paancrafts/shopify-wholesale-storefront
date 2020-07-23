const Applicant = require('../models/Applicants');

/* Create Applicant entry */
exports.create = function(req) {
  const newApplicant = new Applicant(req.body);
  //console.log(req.body)
  newApplicant.save(
    function(err) {
      if (err) {
        console.log('Applicant not saved!', err);
        return err
      } else {
        console.log('Applicant saved!');
        return req.body.email
      }
    }
  );
};

/* Find Applicant by email */
exports.findByEmail = function (user) {
  Applicant.find({ email: user }, 'email activated _id', function (err, docs) {
    if (err) return console.error(err);
    console.log('Controller: ', docs);
    return docs;
  });
}
