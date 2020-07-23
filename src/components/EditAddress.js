import React from 'react';
import Popup from 'reactjs-popup';

export default class EditAddressPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      open: false,
      new_company: '',
      new_address1: '',
      new_address2: '',
      new_first_name: '',
      new_last_name: '',
      new_province: '',
      new_zip: '',
      new_phone: '',
      new_country: '',
      new_city: ''
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.submitAddress = this.submitAddress.bind(this);
  }

  componentWillMount() {
    this.setState({ ...this.props.defaultAddress });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    if(name === 'company') {
      this.setState({
          new_company: value
      });
    }
    if(name === 'city') {
      this.setState({
          new_city: value
      });
    }
    if(name === 'address1') {
      this.setState({
          new_address1: value
      });
    }
    if(name === 'address2') {
      this.setState({
          new_address2: value
      });
    }
    if(name === 'first_name') {
      this.setState({
        new_first_name: value
      });
    }
    if(name === 'last_name') {
      this.setState({
        new_last_name: value
      });
    }
    if(name === 'province') {
      this.setState({
        new_province: value
      });
    }
    if(name === 'country') {
      this.setState({
        new_country: value
      });
    }
    if(name === 'zip') {
      this.setState({
        new_zip: value
      });
    }
    if(name === 'phone') {
      this.setState({
        new_phone: value
      });
    }
  }

  submitAddress() {
    this.props.editDefaultAddress(
      this.state.customer_id, 
      this.state.id, 
      { 
        first_name: this.state.new_first_name || this.state.first_name,
        last_name: this.state.new_last_name || this.state.last_name,
        address1: this.state.new_address1 || this.state.address1,
        address2: this.state.new_address2 || this.state.address2,
        province: this.state.new_province || this.state.province,
        company: this.state.new_company || this.state.company,
        country: this.state.new_country || this.state.country,
        phone: this.state.new_phone || this.state.phone,
        city: this.state.new_city || this.state.city,
        zip: this.state.new_zip || this.state.zip
      }
    );
    this.setState({
      first_name: this.state.new_first_name || this.state.first_name,
      last_name: this.state.new_last_name || this.state.last_name,
      address1: this.state.new_address1 || this.state.address1,
      address2: this.state.new_address2 || this.state.address2,
      province: this.state.new_province || this.state.province,
      company: this.state.new_company || this.state.company,
      country: this.state.new_country || this.state.country,
      phone: this.state.new_phone || this.state.phone,
      city: this.state.new_city || this.state.city,
      zip: this.state.new_zip || this.state.zip
    });
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
    this.setState({ open: false });
  }

  render() {
    return (
      <div>
        <button className="button" onClick={this.openModal}>
          Edit Address
        </button>
        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
          style={{borderRadius: '1rem'}}
        >
          <div className="modal" style={{overflowY:'auto',height:'auto',maxHeight:'85vh',padding:'25px'}}>
            <a className="close-popup" onClick={this.closeModal}>
              &times;
            </a>
            <div style={{margin:'0 0 20px'}}>
              <h2>Edit Shipping Address</h2>
              <p style={{fontSize:'1.275rem'}}>Enter new data to the necessary fields and confirm changes with 'Save Address' button.</p>
            </div>
            {this.state.customer_id !== null && 
              <div>
                <label className="EditAddress">
                  Company:
                  <input className="EditAddress_input" type="text" placeholder={this.state.company} name={"company"} onChange={this.handleInputChange}></input>
                </label>
                <label className="EditAddress">
                  First name:
                  <input className="EditAddress_input" type="text" placeholder={this.state.first_name} name={"first_name"} onChange={this.handleInputChange}></input>
                </label>
                <label className="EditAddress">
                  Last name:
                  <input className="EditAddress_input" type="text" placeholder={this.state.last_name} name={"last_name"} onChange={this.handleInputChange}></input>
                </label>
                <label className="EditAddress">
                  Address Line 1:
                  <input className="EditAddress_input" type="text" placeholder={this.state.address1} name={"address1"} onChange={this.handleInputChange}></input>
                </label>
                <label className="EditAddress">
                  Address Line 2:
                  <input className="EditAddress_input" type="text" placeholder={this.state.address2} name={"address2"}  onChange={this.handleInputChange}></input>
                </label>
                <label className="EditAddress">
                  City:
                  <input className="EditAddress_input" type="text" placeholder={this.state.city} name={"city"}  onChange={this.handleInputChange}></input>
                </label>
                <label className="EditAddress">
                  Province:
                  <input className="EditAddress_input" type="text" placeholder={this.state.province} name={"province"}  onChange={this.handleInputChange}></input>
                </label>
                <label className="EditAddress">
                  ZIP Code:
                  <input className="EditAddress_input" type="text" placeholder={this.state.zip} name={"zip"}  onChange={this.handleInputChange}></input>
                </label>
                <label className="EditAddress">
                  Country:
                  <input className="EditAddress_input" type="text" placeholder={this.state.country} name={"country"}  onChange={this.handleInputChange}></input>
                </label>
                <label className="EditAddress">
                  Phone:
                  <input className="EditAddress_input" type="text" placeholder={this.state.phone} name={"phone"}  onChange={this.handleInputChange}></input>
                </label>
                <button className="button button-danger" onClick={this.closeModal}>Cancel Changes</button>
                <button className="button button-success" onClick={this.submitAddress}>Save Address</button>
              </div>
            }
          </div>
        </Popup>
      </div>
    );
  }
}