import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import axios from 'axios';
import ApplicationTerms from './ApplicationTerms';
import WholesaleTerms from './WholesaleTerms';
import PrivacyPolicy from './PrivacyPolicy';

export default class ApplicationForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      storeName: '',
      socialMediaHandles: '',
      businessName: '',
      licence: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      zip: '',
      state: '',
      country: 'United States',
      message: '',
      activated: false,
      emailSent: false,
      selectedFile: null,
      uploadedFileName: '',
      uploadedFilePath: '',
      fileLoaded: false,
      sendingApplication: false,
      terms: false,
    }
    this.selectCountry = this.selectCountry.bind(this);
    this.selectRegion = this.selectRegion.bind(this);
    this.submitApplication = this.submitApplication.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.handleTermsCheckbox = this.handleTermsCheckbox.bind(this);
    this.sendApplication = this.sendApplication.bind(this);
  }
  selectCountry (val) {
    this.setState({ country: val });
  }
  selectRegion (val) {
    this.setState({ state: val });
  }
  handleFileUpload (event) {
    this.setState({
      selectedFile: event.target.files[0],
    });
  }
  handleTermsCheckbox () {
    if (this.state.terms) {
      this.setState({ terms: false });
    } else {
      this.setState({ terms: true });
    }
  }
  sendApplication (data) {
    this.setState({
      sendingApplication: true,
    });
    fetch('/api/ws-application', {
      method: 'POST',
      body: JSON.stringify(data), 
      headers:{
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then((response) => {
      if (response.status === 'failed') {
        alert('Entered email is already associated with an application in queue. Application aborted.');
        this.setState({
          selectedFile: null,
          uploadedFileName: null,
          uploadedFilePath: null,
          fileLoaded: false,
          sendingApplication: false,
        });
        document.getElementById("js-form-reset-btn").click();
        return
      }
      if (response.status === 'success') {
        this.setState({
          selectedFile: null,
          uploadedFileName: null,
          uploadedFilePath: null,
          fileLoaded: false,
          sendingApplication: false,
        });
        document.getElementById("js-form-reset-btn").click();
        window.location.replace("/wholesale-application-sent");
      }
    })
    .catch(error => console.error('Error:', error));
  }
  submitApplication (currentState, formFields) {

   if (currentState.selectedFile !== null) {
    const fileData = new FormData();
    fileData.append('file', this.state.selectedFile);
    axios.post('/api/upload-reseller-cert', fileData, {})
      .then(res => { 
        this.setState({
          fileLoaded: true,
          uploadedFileName: res.data.filename,
          uploadedFilePath: res.data.path,
        }, () => { 
          let applicationData = {...formFields};
          applicationData.country = currentState.country;
          applicationData.state = currentState.state;
          applicationData.fileLoaded = true;
          applicationData.uploadedFileName = res.data.filename;
          applicationData.uploadedFilePath = res.data.path;
          this.sendApplication(applicationData)
        });
      })
    } else {
      let applicationData = {...formFields};
      applicationData.country = currentState.country;
      applicationData.state = currentState.state;
      this.sendApplication(applicationData)
    }
  }
  render() {
    const chkbxInputStyles = {
      display: 'inline-block',
      width: '25px',
      height: '16px',
    };
    return (
      <Formik
        initialValues={this.state}
        validationSchema={Yup.object().shape({
          businessName: Yup.string()
            .required('Business name is required'),
          licence: Yup.string()
            .required('Licence is required'),
          firstName: Yup.string()
            .required('First name is required'),
          lastName: Yup.string()
            .required('Last name is required'),
          email: Yup.string()
            .email('Check email format')
            .required('Email is required'),
          phone: Yup.string()
            .min(9, 'Too Short!')
            .max(20, 'Too Long!')
            .required('Phone is required'),
          addressLine1: Yup.string()
            .required('Address line 1 is required'),
          city: Yup.string()
            .required('City is required'),
          zip: Yup.number()
            .required('ZIP/Postal code is required'),
          message:  Yup.string()
            .required('Message is required')
        })}
        onSubmit={fields => {
          this.submitApplication(this.state, fields);
        }}
        render={({ errors, status, touched }) => (
          <div className="contact_form">
            <div>
              <a href="/">
                <img style={{
                display: 'block', 
                margin: '50px auto 35px'
                }} src="xxxxx" alt="xxxxx" />
              </a>
              <h1>
                Apply for Wholesale Account*<br></br>
                <span style={{color: 'red', fontSize: '1.2rem' }}>(* Amazon sellers need not apply)</span>
              </h1>
            </div>
            <Form>
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="storeName">Salon/Barbershop/Shop Name</label>
                  <Field name="storeName" type="text" placeholder="Salon/Barbershop/Shop Name" />
                </div>
                <div className="form-group">
                  <label htmlFor="socialMediaHandles">Social Media Handles</label>
                  <Field name="socialMediaHandles" type="text" placeholder="Social Media Handles" />
                </div>
                <div className="form-group">
                  <label htmlFor="businessName">Business Name</label>
                  <ErrorMessage name="businessName" component="div" className="invalid-feedback" /> 
                  <Field name="businessName" type="text" placeholder="Business Name" className={'form-control' + (errors.businessName && touched.businessName ? ' is-invalid' : '')} />
                </div>
                <div className="form-group">
                  <label htmlFor="licence">Professional Licence Number</label>
                  <ErrorMessage name="licence" component="div" className="invalid-feedback" />
                  <Field name="licence" type="text" placeholder="Professional Licence Number" className={'form-control' + (errors.businessName && touched.businessName ? ' is-invalid' : '')} />
                  
                </div>
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                  <Field name="firstName" type="text" placeholder="First Name" className={'form-control' + (errors.firstName && touched.firstName ? ' is-invalid' : '')} />
                  
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                  <Field name="lastName" type="text" placeholder="Last Name" className={'form-control' + (errors.lastName && touched.lastName ? ' is-invalid' : '')} />
                  
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <ErrorMessage name="country" component="div" className="invalid-feedback" />
                  <div className="select-container">
                    <CountryDropdown
                      name='country'
                      showDefaultOption={false}
                      value={this.state.country}
                      onChange={(val) => this.selectCountry(val)}
                      whitelist={['US']}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <ErrorMessage name="email" component="div" className="invalid-feedback" />
                  <Field name="email" type="text" placeholder="Email Address" className={'form-control' + (errors.email && touched.email ? ' is-invalid' : '')} />
                  
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <ErrorMessage name="phone" component="div" className="invalid-feedback" />
                  <Field name="phone" type="text" placeholder="Phone Number" className={'form-control' + (errors.phone && touched.phone ? ' is-invalid' : '')} />
                  
                </div>
                <div className="form-group">
                  <label htmlFor="addressLine1">Address Line 1</label>
                  <ErrorMessage name="addressLine1" component="div" className="invalid-feedback" />
                  <Field name="addressLine1" type="text" placeholder="Address Line 1" className={'form-control' + (errors.addressLine1 && touched.addressLine1 ? ' is-invalid' : '')} />
                </div>
                <div className="form-group">
                  <label htmlFor="addressLine2">Address Line 2</label>
                  <Field name="addressLine2" type="text" placeholder="Address Line 2" />
                </div>
                <div className="form-group">
                  <label htmlFor="zip">ZIP/Postal code</label>
                  <ErrorMessage name="zip" component="div" className="invalid-feedback" />
                  <Field name="zip" type="text" placeholder="ZIP/Postal code" className={'form-control' + (errors.zip && touched.zip ? ' is-invalid' : '')} />
                  
                </div>
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <ErrorMessage name="city" component="div" className="invalid-feedback" />
                  <Field name="city" type="text" placeholder="City" className={'form-control' + (errors.city && touched.city ? ' is-invalid' : '')} />
                  
                </div>

                
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <div className="select-container">
                    <RegionDropdown
                      name='region'
                      defaultOptionLabel='Select state'
                      country={this.state.country}
                      value={this.state.state}
                      onChange={(val) => this.selectRegion(val)} 
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="state">Upload re-seller certificate (optional)</label>
                <input className="file-input" type="file" name="file" onChange={this.handleFileUpload} />
              </div>
              <div className="form-group">
                <label htmlFor="message">Tell us a little bit about your business</label>
                <ErrorMessage name="message" component="div" className="invalid-feedback" />
                <Field name="message" component="textarea" rows="4" placeholder="The things you think we should know about you" className={'form-control' + (errors.message && touched.message ? ' is-invalid' : '')} />
                
              </div>
              <div className="form-group">
                <Field style={chkbxInputStyles} as="checkbox" name="terms" type="checkbox" value={this.state.terms} onChange={this.handleTermsCheckbox} />
                <label style={{ color: '#c3bfbf' }} className="checkbox-label" htmlFor="terms">I accept the <ApplicationTerms />, <WholesaleTerms /> and <PrivacyPolicy />.</label>
              </div>
              <div className="form-group btn-group">
                <button 
                  type="submit" 
                  className="button btn-primary mr-2" 
                  disabled={this.state.terms ? false : true}
                >
                  {this.state.sendingApplication ? 'Sending application...' : 'Send Application'}
                </button>
                <button id="js-form-reset-btn" type="reset" className="button btn-secondary">
                  Clear All Fields
                </button>
              </div>
            </Form>
          </div>
        )}
      />
    )
  }
}