import React from 'react';
import Popup from 'reactjs-popup';

export default class ChangePasswordPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      open: false,
      pass: '',
      confirmPass: '',
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.changePass = this.changePass.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if(name === 'pass') {
      this.setState({
          pass: value
      });
    }
    if(name === 'confirmPass') {
      this.setState({
          confirmPass: value
      });
    }
  }

  changePass() {
    if (this.state.pass !== '' && this.state.confirmPass !== '') {
      if (this.state.pass === this.state.confirmPass) {
        this.props.changePwd(this.props.customerId, {
          password: this.state.pass,
          password_confirmation: this.state.confirmPass,
          send_email_welcome: false
        });
      } else {
        alert('Passwords do not match')
      }
    } else {
      alert('Enter passwords')
    }
    this.closeModal();
  }

  openModal() {
    if(this.state.customer_id !== null) {
      this.setState({ 
        open: true
      });
    }
  }
  closeModal() {
    this.setState({ 
      open: false,
      pass: '',
      confirmPass: '',
    });
  }

  render() {
    return (
      <div style={{marginTop:'15px',borderTop:'1px solid #333',paddingTop:'15px'}}>
        <h2>Account settings</h2>
        <button className="button change-pwd" onClick={this.openModal}>
          Change Password
        </button>
        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
          style={{borderRadius: '1rem'}}
        >
          <div className="modal" style={{overflowY:'auto',height:'auto',padding:'25px'}}>
            <a className="close-popup" onClick={this.closeModal}>
              &times;
            </a>
            <div style={{margin:'0 0 20px'}}>
              <h2>Change password</h2>
              <p style={{fontSize:'1.275rem'}}>Please choose a secure new password with more than 8 characters and confirm changes with 'Change Password' button.</p>
            </div>
            {this.state.customer_id !== null && 
              <div>
                <label className="EditAddress">
                  New password:
                  <input className="EditAddress_input" type="password" placeholder="Enter new password" name={"pass"} onChange={this.handleInputChange} minLength="5" required></input>
                </label>
                <label className="EditAddress">
                  Confirm new password:
                  <input className="EditAddress_input" type="password" placeholder="Re-enter new password" name={"confirmPass"} onChange={this.handleInputChange} minLength="5" required></input>
                </label>
                
                <button className="button button-danger" onClick={this.closeModal}>Cancel Changes</button>
                <button className="button button-success" type="submit" onClick={this.changePass}>Change Password</button>
              </div>
            }
          </div>
        </Popup>
      </div>
    );
  }
}