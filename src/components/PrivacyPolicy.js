import React from 'react';
import Popup from 'reactjs-popup';

export default class ApplicationTermsPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      open: false,
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
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
    const chkbxLabelLinkStyles = { 
      fontSize: '1.6rem', 
      textDecoration: 'underline', 
      cursor: 'pointer',
    };
    return (
      <span>
        <a onClick={this.state.open ? this.closeModal : this.openModal} style={chkbxLabelLinkStyles}>
          Privacy Policy
        </a>
        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
          style={{borderRadius: '1rem'}}
        >
          <div className="modal" style={{overflowY:'auto',height:'auto',maxHeight:'85vh',padding:'25px', color: '#3a3a3a'}}>
            <a className="close-popup" onClick={this.closeModal}>
              &times;
            </a>
            <div style={{margin:'0 0 20px', fontSize: '1.5rem'}}>
              <h2 style={{fontSize: '2.75rem'}}>Privacy Policy</h2>
            </div>
          </div>
        </Popup>
      </span>
    );
  }
}