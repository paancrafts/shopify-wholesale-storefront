import React, {Component} from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

class CustomerAuth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      customer: {},
      nonFieldErrorMessage: null,
      emailErrorMessage: null,
      passwordErrorMessage: null
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.resetErrorMessages = this.resetErrorMessages.bind(this);
    this.resetInputFields = this.resetInputFields.bind(this);
  }

  static propTypes = {
    customerCreate: PropTypes.func.isRequired,
    customerAccessTokenCreate: PropTypes.func.isRequired,
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({[name]: value});
  }

  resetErrorMessages(){
    this.setState({
      nonFieldErrorMessage: null,
      emailErrorMessage: null,
      passwordErrorMessage: null
    });
  }

  resetInputFields(){
    this.setState({
      email: '',
      password: ''
    });
  }

  handleSubmit(email, password){
    this.resetErrorMessages();
    this.loginCustomerAccount(email, password)
  }

  loginCustomerAccount(email, password){
    const input = {
      email: email,
      password: password
    }
    this.props.customerAccessTokenCreate(
      { variables: { input }
      }).then((res) => {
        if (res.data.customerAccessTokenCreate.customerAccessToken) {
          this.props.associateCustomerCheckout(res.data.customerAccessTokenCreate.customerAccessToken.accessToken);
          this.props.handleToken(res.data.customerAccessTokenCreate.customerAccessToken.accessToken);
          this.props.loadProducts();
        } else {
          res.data.customerAccessTokenCreate.userErrors.forEach(function (error) {
            if (error.field != null) {
              this.setState({
                [error.field + "ErrorMessage"]: error.message
              });
            } else {
              this.setState({
                nonFieldErrorMessage: error.message
              });
            }
          }.bind(this));
        }
    });
  }

  render() {
    return (
      <div className={`CustomerAuth ${this.props.isCustomerAuthOpen ? 'CustomerAuth--open' : ''}`}>
        <div className="App__title" style={{textAlign: 'center', marginTop: '100px'}}>
            <img style={{display: 'block', margin: '0 auto'}} src="https://cdn.shopify.com/s/files/1/1920/3539/files/RCH_WS-brands-RCH-white-01.svg?223" alt="RICH Hair Care Logo" />
          </div>
        <div className="CustomerAuth__body">
          <h2 style={{textAlign: 'center', textTransform: 'uppercase', fontWeight: '100', fontSize: '1.95rem'}} className="CustomerAuth__heading">{this.props.newCustomer ? 'Create your Account' : 'Log in to your account'}</h2>
          {this.state.nonFieldErrorMessage &&
            <div className="error">{this.state.nonFieldErrorMessage}</div>
          }
          <label className="CustomerAuth__credential">
            <input className="CustomerAuth__input" type="email" placeholder="Email" name={"email"} value={this.state.email} onChange={this.handleInputChange}></input>
            {this.state.emailErrorMessage &&
              <div className="error">{this.state.emailErrorMessage}</div>
            }
          </label>
          <label className="CustomerAuth__credential">
            <input className="CustomerAuth__input" type="password" placeholder="Password" name={"password"} value={this.state.password} onChange={this.handleInputChange}></input>
            {this.state.passwordErrorMessage &&
              <div className="error">{this.state.passwordErrorMessage}</div>
            }
          </label>
          <button className="CustomerAuth__submit button" type="submit" onClick={() => this.handleSubmit(this.state.email, this.state.password)}>{this.props.newCustomer ? 'Create Account' : 'Log in'}</button>
          <p style={{display:'block',textAlign:'center',padding:'15px'}}><a href="/apply-for-wholesale-account" className="auth-form-link">Apply for Wholesale Account (US and Canada)</a></p>
        </div>
      </div>

    )
  }
}

const customerCreate = gql`
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      userErrors {
        field
        message
      }
      customer {
        id
      }
    }
  }
`;

const customerAccessTokenCreate = gql`
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      userErrors {
        field
        message
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
    }
  }
`;

const CustomerAuthWithMutation = compose(
  graphql(customerCreate, {name: "customerCreate"}),
  graphql(customerAccessTokenCreate, {name: "customerAccessTokenCreate"}),
)(CustomerAuth);

export default CustomerAuthWithMutation;
