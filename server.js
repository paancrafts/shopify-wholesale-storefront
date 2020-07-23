require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const app = express();
const multer = require('multer');
const cors = require('cors');
const mongodb = require('./mongodb');
const applicantController = require('./controllers/Applicants');
const ApplicantDataTable = require('./src/components/ApplicantTable');
const Applicant = require('./models/Applicants');
const BoxSDK = require('box-node-sdk');
var CronJob = require('cron').CronJob;
const Shopify = require('shopify-api-node');
const nodemailer = require("nodemailer");

// enable ssl redirect
app.use(sslRedirect());
app.use(express.urlencoded({ extended: true }));

/*  Save log to file and log with Morgan  */
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

/* Initialize the BOX SDK with app credentials */
var sdkConfig = require('xxxxxxxxxxxxxx');
var sdk = BoxSDK.getPreconfiguredInstance(sdkConfig);
var serviceAccountClient = sdk.getAppAuthClient('enterprise', 'XXXXXXXXXXXXXXX');

// Nodemailer setup
const transport = nodemailer.createTransport({
  host: "smtp.XXXXXXX.xx",
  port: XXX,
  secure: true, // use TLS
  auth: {
    user: process.env.MAILERUSER,
    pass: process.env.MAILERPW
  },
  tls: {
    rejectUnauthorized: false
  }
});

/* Connect to Shopify GraphQL API */
const shopify = new Shopify({
  shopName: process.env.STORE_NAME,
  apiKey: process.env.GQL_API_KEY,
  apiVersion: '2019-10',
  password: process.env.GQL_ACCESS_TOKEN,
});
shopify.on('callLimits', (limits) => console.log(limits));

function generateToken() {
  var length = 13,
      charset = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789=-*#$€£',
      retVal = '';
  for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

function base64ToAscii(encodedData) {
  const decoded = new Buffer.from(encodedData, 'base64').toString('ascii');
  const data = decoded.match(/\d+/);
  return data;
}

/* Send Re-seller Certificate */
app.post('/api/upload-reseller-cert', function(req, res) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    },
    limits: {
      fileSize: '2MB',
    },
  })
  const upload = multer({ storage: storage }).single('file')
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err)
    } else if (err) {
        return res.status(500).json(err)
    }
    return res.status(200).send(req.file)
  })
});

/* Send Wholesale Account application */
app.post('/api/ws-application', function(req, res) {
  // Encode user email
  let encodedEmail = Buffer.from(req.body.email).toString('base64');
  Applicant.find({ email: req.body.email }, function (err, docs) {
    if (err !== null) {
      console.error(err)
      res.send(err);
    };
    if (docs.length === 0) {
      if (req.body.fileLoaded === true) {
        const stream = fs.createReadStream(req.body.uploadedFilePath);
        const folderID = '99135373364'
        serviceAccountClient.files.uploadFile(folderID, req.body.uploadedFileName, stream)
          .then(file => console.log('File saved to Box'))
          .catch(err => console.log(err));
      } 
      applicantController.create(req);
      let adminMessageWithFile = {
        from: 'do-not-reply@richhaircare.com',
        to: process.env.SUPPORT_EMAIL,
        bcc: process.env.DEV_EMAIL,
        subject: 'New RICH Wholesale Account Application',
        html: `
          <img style="width:30%;text-align:left;padding:10px;" src="https://cdn.shopify.com/s/files/1/1999/2917/files/RICH_TM_LOGO_400x180px_400x.png?v=1499781286" alt="RICH Haircare Logo" />
          <div style="padding:10px;">
            <h2>NEW WHOLESALE ACCOUNT APPLICATION.</h2>
            <p>Please check the application data and contact the customer for further information if needed.</p>
            <h3>Wholesale Applicant data:</h3>
            ${ApplicantDataTable(req.body)}
            <h3>ACCEPTING THE APPLICATION</h3>
            <h4 style="color:red;">Remember! You need to add the wholesale % tag (for example WS-50) in Shopify admin to the newly created customer after application has been accepted.
            <br>
            The customer has added a re-seller certificate to this application! Please un-check "Collect tax" option in the Shopify admin customer view after confirming the certificate is valid.</h4>
            <p style="font-weight:bold;">Click on the following link to accept wholesale application:</p>
            <p><a href="https://pro.richhaircare.com/confirm/${encodedEmail}" >https://pro.richhaircare.com/confirm/${encodedEmail}</a></p>
            <p style="font-size:65%;margin-top:50px;margin-bottom:50px;">&copy;2020 - RICH International Creative Haircare Ltd - Wholesale Application</p>
          </div>
        `,
        attachments: [
          {
            path: `./${req.body.uploadedFilePath}`,
          }
        ]
      };
      let adminMessageNoFile = {
        from: 'do-not-reply@richhaircare.com',
        to: process.env.SUPPORT_EMAIL,
        bcc: process.env.DEV_EMAIL,
        subject: 'New RICH Wholesale Account Application',
        html: `
          <img style="width:30%;text-align:left;padding:10px;" src="https://cdn.shopify.com/s/files/1/1999/2917/files/RICH_TM_LOGO_400x180px_400x.png?v=1499781286" alt="RICH Haircare Logo" />
          <div style="padding:10px;">
            <h2>NEW WHOLESALE ACCOUNT APPLICATION.</h2>
            <p>Please check the application data and contact the customer for further information if needed.</p>
            <h3>Wholesale Applicant data:</h3>
            ${ApplicantDataTable(req.body)}
            <h3>ACCEPTING THE APPLICATION</h3>
            <h4 style="color:red;">Remember! You need to add the wholesale % tag (for example WS-50) in Shopify admin to the newly created customer after application has been accepted.
            </h4>
            <p style="font-weight:bold;">Click on the following link to accept wholesale application:</p>
            <p><a href="https://pro.richhaircare.com/confirm/${encodedEmail}" >https://pro.richhaircare.com/confirm/${encodedEmail}</a></p>
            <p style="font-size:65%;margin-top:50px;margin-bottom:50px;">&copy;2020 - RICH International Creative Haircare Ltd - Wholesale Application</p>
          </div>
        `
      };
      let adminMessage = () => {
        if (req.body.fileLoaded === true) {
          return adminMessageWithFile;
        } else {
          return adminMessageNoFile;
        }
      };
      let clientMessage = {  
        from: 'do-not-reply@richhaircare.com',
        to: req.body.email,
        bcc: process.env.DEV_EMAIL,
        subject: 'RICH Wholesale Account Application has been sent',
        html: `
          <img style="width:30%;text-align:left;padding:10px;" src="https://cdn.shopify.com/s/files/1/1999/2917/files/RICH_TM_LOGO_400x180px_400x.png?v=1499781286" alt="RICH Haircare Logo" />
          <div style="padding:10px;">
            <h2>Thank you for submitting your Wholesale Application.
              <br />We'll get back to you in 48 hours.
            </h2>
            <p>This is an automatic notification. Please do not reply to this email.</p>
            <h3>Your Wholesale Application data:</h3>
            ${ApplicantDataTable(req.body)}
            <h3>Thanks for being a RICH fan!</h3>
            <p style="font-size:65%;margin-top:50px;">&copy;2020 - RICH International Creative Haircare Ltd</p>
          </div>
        `
      };
      // Prepare server and send emails
      transport.verify(function(error, success) {
        if (error) {
          console.log(error);
        } 
        if (success) {
          console.log("INFO: Email server ready to deliver messages.");
          transport.sendMail(adminMessage(), function(err) {  
            if (err) {
              console.log(err)
            } else {
              transport.sendMail(clientMessage, function(err) {
                if(err) {
                  console.log(err);
                } else {
                  console.log('Client message sent');
                }
              });
              console.log('Admin message sent');
            }
          });
          res.send({ 
            email: req.body.email,
            message: 'Success!',
            status: 'success',
          });
          return
        }
      });
    }
    // Fail when email has been already registered
    if (docs.length > 0) {
      res.send({ 
        email: req.body.email,
        message: 'Failed! Another wholesale application with the same contact email is in queue for approval.',
        status: 'failed',
      });
      return
    }
  });
});

/*  Confirm Wholesale Application  */
app.post('/api/confirm-application', function (req, res) {
  let emailDecoded = Buffer.from(req.body.user, 'base64').toString('ascii');
  Applicant.find({ email: emailDecoded }, function (err, docs) {
    if (err !== null) {
      console.error(err)
      res.send(err);
    };
    shopify.customer
    .list()
    .then((data) => {
      if (docs.length === 0) {
        res.send({message: 'No Wholesale Application associated with entered email.'})
        return
      }
      if (docs.length > 0) {
        let existingCustomer = data.find(customer => customer.email === docs[0].email);	
        if (existingCustomer !== undefined) {	
          res.send({message: 'This user already has an account.'})	
          return 	
        }
        if (!docs[0].activated) {
          const metafieldsDetails = {
            key: [
              'storeName',
              'sMH',
              'businessName',
              'licence'
            ],
            value: [
              docs[0].storeName,
              docs[0].socialMediaHandles,
              docs[0].businessName,
              docs[0].licence,
            ],
            value_type: 'string',
            namespace: 'wholesalerData'
          }
          const newUserToken = generateToken();
          shopify.customer
          .create({
            first_name: docs[0].firstName,
            last_name: docs[0].lastName,
            email: docs[0].email,
            password: newUserToken,
            password_confirmation: newUserToken,
            send_email_welcome: false,
            verified_email: true,
            tags: 'WS',
            note: `
              Salon/Barbershop/Store: ${docs[0].storeName}
              Social Media Handles: ${docs[0].socialMediaHandles}
              Business Name: ${docs[0].businessName}
              Licence: ${docs[0].licence}
            `,
            addresses: [
              {
                company: docs[0].businessName,
                address1: docs[0].addressLine1,
                address2: docs[0].addressLine2 || null,
                city: docs[0].city,
                province: docs[0].state,
                phone: docs[0].phone,
                zip: docs[0].zip,
                last_name: docs[0].lastName,
                first_name: docs[0].firstName,
                country: docs[0].country
              }
            ],
            metafields: [
              {
                key: metafieldsDetails.key[0],
                value: metafieldsDetails.value[0],
                value_type: metafieldsDetails.value_type,
                namespace: metafieldsDetails.namespace
              },
              {
                key: metafieldsDetails.key[1],
                value: metafieldsDetails.value[1],
                value_type: metafieldsDetails.value_type,
                namespace: metafieldsDetails.namespace
              },
              {
                key: metafieldsDetails.key[2],
                value: metafieldsDetails.value[2],
                value_type: metafieldsDetails.value_type,
                namespace: metafieldsDetails.namespace
              },
              {
                key: metafieldsDetails.key[3],
                value:metafieldsDetails.value[3],
                value_type: metafieldsDetails.value_type,
                namespace: metafieldsDetails.namespace
              }
            ]
          })
          .then((response) => {
            var query = { email: emailDecoded };
            let confirmationDate = Date.now();
            Applicant.findOneAndUpdate(query, { activated: true, token: newUserToken, confirmationDate: confirmationDate }, function(err, doc) {
              if (err) {
                console.error(err)
                res.send(err);
              };
              res.send(doc);
              return
            });
            return response;
          })
          .catch(err => {
            console.log(err);
            res.status(400)
          });
        }
        if (docs[0].activated) {
          res.send({message: 'This user account has already been confirmed.'})
          return
        }

      }
    
    })
    .catch(err => console.log(err))
      
  });
});

/*  Get Index page  */
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

/*  Get Customer Default Address  */
app.post('/api/getdefaultaddress', function (req, res) {
  const customerId = base64ToAscii(req.body.customerId);
  const addressId = base64ToAscii(req.body.addressId);
  shopify.customerAddress
  .default(Number(customerId[0]),Number(addressId[0]))
  .then(response => res.status(200).json(response))
  .catch(err => console.log(err))
});

/*  Update Customer Default Address  */
app.put('/api/editdefaultaddress', function (req, res) {
  shopify.customerAddress
  .update(req.body.customerId, req.body.addressId, req.body.params)
  .then(response => res.status(200).json(response))
  .catch(err => console.log(err))
});

/*  Update Customer Default Address  */
app.post('/api/changepwd', function (req, res) {
  const customerId = base64ToAscii(req.body.customerId);
  shopify.customer
  .update(customerId, req.body.params)
  .then((response) => res.status(200).json({ statusCode: 200, statusMessage: 'Password changed' }))
  .catch(err => res.status(err.statusCode).json({ statusCode: err.statusCode, statusMessage: err.statusMessage }))
});

/*  Look for an already finished Checkout  */
app.post('/api/confirmcheckout', function (req, res) {
  let responseToClient;
  const checkoutToken = req.body.key;
  shopify.order
  .list()
  .then(response => {
    if (response.length <= 0) {
      responseToClient = {
        checkoutCompleted: false,
        message: 'Checkout will open in a new window.'
      }
    } else {
      response.filter(order => {
        if (order.checkout_token === checkoutToken) {
          responseToClient = {
            checkoutCompleted: true,
            message: 'A checkout with the same ID has already been completed. Cart contents will be deleted!'
          }
        } else {
          responseToClient = {
            checkoutCompleted: false,
            message: 'Checkout will open in a new window.'
          }
        }
      });
    } 
    res.json(responseToClient);
  })
  .catch(err => console.log(err))
});

/*  Get Draft Orders  */
app.post('/api/dolist', (req, res) => {
  const customerId = base64ToAscii(req.body.customerId);
  shopify.draftOrder
  .list()
  .then((response) => {
    const drafts = [];
    response.map((draftOrder) => {
      if (draftOrder.customer.id === Number(customerId[0])) {
        drafts.push(draftOrder)
      }
    });
    res.json(drafts)
  })
  .catch((err) => res.json(err))
})

/*  Create Draft Order & send Notification Email  */
app.post('/api/docreate', (req, res) => {
  const customerId = base64ToAscii(req.body.customer.id);
  const checkoutLineItems = req.body.cartData.lineItems.edges.map(item => item.node);
  function cartDataIdsDecoded(data) {
    data.map((item) => {
      if(item.id) { item.id = base64ToAscii(item.id) }
      if(item.variant.id) { item.variant.id = base64ToAscii(item.variant.id) }
    })
    return data
  } 
  const draftOrderLineItems = cartDataIdsDecoded(checkoutLineItems).map(item => {
    return { 
      variant_id: Number(item.variant.id[0]),
      quantity: item.quantity,
    }
  });
  shopify.draftOrder
  .create({
    line_items: draftOrderLineItems,
    customer: {
      id: Number(customerId[0]),
    },
    use_customer_default_address: true
  })
  .then((response) => {
    function addDays(date, days) {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }
    function formatDate(date) {
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      var today  = new Date(date);
      return today.toLocaleDateString("en-US", options)
    }
    const discountTag = response.customer.tags.split(', ').find(tag => tag.includes('WS-'));
    const creditTag = response.customer.tags.split(', ').find(tag => tag.includes('NET-'));
    const creditDays = creditTag.replace(/\D/g,'');
    const discountPercent = Number(discountTag.replace(/\D/g,''));
    const amountWithDiscount = parseFloat(response.subtotal_price) * discountPercent / 100;
    shopify.draftOrder
    .update(response.id,{
      applied_discount: {
        description: discountTag,
        value_type: "fixed_amount",
        value: amountWithDiscount,
        amount: amountWithDiscount,
        title: discountTag
      },
      note: `Order has to be paid in full in ${creditDays} days. Final day for payment is ${formatDate(new Date(addDays(response.created_at, Number(creditDays))))}.`
    })
    .then((response) => {
      shopify.draftOrder
      .sendInvoice(response.id,{})
      .then(response => res.json(response))
      .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
  })
  .catch(err => console.log(err))
});

/* CRON jobs */
/* Send confirmation emails out to applicants when */
/* 24 hours has passed from application confirmation */
function checkEmailConfirmationStatus() {
  let now = Date.now();
  Applicant.find({ emailSent: false }, function (err, docs) {
    if (err !== null) {
      console.error(err)
    };
    if (docs) {
      const oneDay = 1000 * 60 * 60 * 24;
      docs.filter((applicant) => {
        let compareDatesBoolean = (now - applicant.confirmationDate) > oneDay;
        if (compareDatesBoolean) {
          // Prepare applicant confirmation email
          const clientConfirmationMessage = {  
            from: 'do-not-reply@richhaircare.com',
            to: `${applicant.email}`,
            bcc: process.env.DEV_EMAIL,
            subject: 'Congratulations! Your RICH Wholesale Account Application has been APPROVED!',
            html: `
              <img style="width:30%;text-align:left;padding:10px;" src="https://cdn.shopify.com/s/files/1/1999/2917/files/RICH_TM_LOGO_400x180px_400x.png?v=1499781286" alt="RICH Haircare Logo" />
              <div style="padding:10px;">
                <h2><span style="text-transform:uppercase;">Congratulations!</span><br/>Your Wholesale Application has been APPROVED!</h2>
                <p>You can now log in to the <a href="https://pro.richhaircare.com/">RICH Wholesale Store</a>. This is an automatic notification. Please do not reply to this email. 
                  <br/><br/>Username: ${applicant.email}
                  <br/>Password: ${applicant.token}
                  <br/><br/><span style="font-weight:bold;">IMPORTANT: Please change the password immediately after first login. The 'Change Password' button is found in the Account view.</span>
                </p>
                <h3>Let's make beautiful business together!</h3>
                <p style="font-size:65%;margin-top:50px;">&copy;2020 - RICH International Creative Haircare Ltd</p>
              </div>
            `
          };
          transport.sendMail(clientConfirmationMessage, function(err) {
            if (err) {
              console.log(err)
            } else {
              console.log(`${applicant.email} confirmation message sent`);
              var query = { email: applicant.email };
              Applicant.findOneAndUpdate(query, { emailSent: true }, function(err, doc) {
                if (err) {
                  console.error(err)
                  // res.send(err);
                };
                console.log(`${applicant.email} updated after confirmation message sent.`)
                // res.send(doc);
                return
              });
            }
          });
        }
      });
    } else {
      return;
    }
  });
}
var checkAndSendConfirmationToClient = new CronJob('0 */10 * * * *', function() {
  checkEmailConfirmationStatus()
}, null, true, 'America/Los_Angeles');
checkAndSendConfirmationToClient.start();

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

/*  Init Server  */
app.listen(process.env.PORT || 8080);
