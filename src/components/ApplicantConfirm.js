import React from 'react';

export default class ApplicantConfirmPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null
    }
    this.confirmUser = this.confirmUser.bind(this);
  }
  componentWillMount () {
    const { user } = this.props.match.params;
    this.setState({ user });
  }
  componentDidMount () {
    //console.log(this.state)
    this.confirmUser(this.state)
  }
  confirmUser (user) {
    fetch('/api/confirm-application', {
      method: 'POST',
      body: JSON.stringify(user),
      headers:{
        'Content-Type': 'application/json'
      }
    })
    .then(data => data.json())
    .then(response => {
      this.setState({
        user: response,
      });
    })
    .catch(error => console.error('Error:', error));
  }
  render() {
    return (
      <div className="Apply-Form-page" style={{position:'relative'}}>
        <div style={{
          textAlign:'center',
          color:'#bbb',
          margin:'0',
          position: 'absolute',
          top: '50%',
          left: '50%',
          msTransform:'translate(-50%, -50%)',
          transform:'translate(-50%, -50%)'
          }}>
          <a href="/">
            <img style={{
            display: 'block', 
            margin: '50px auto 35px'
            }} src="xxx" alt="xxxx" />
          </a>
          {!this.state.user.email && !this.state.user.message &&
            <div style={{ position: 'relative', margin: '0', padding: '0', width: '100%', height: '100vh', background: '#000', textAlign: 'center'}}>
              <img src="loader.gif" style={{ position: 'absolute', margin: 'auto', top: '0', right: '0', bottom: '0', left: '0' }} alt=""></img>
            </div>
          }
          {!this.state.user.email && this.state.user.message && 
            <p style={{
              fontSize:'2rem'
              }}>{this.state.user.message}
            </p>
          }
          {this.state.user.email &&
          <div>
            <h1 style={{
              color:'center',
              padding:'0px 50px 25px'
              }}>Wholesale Application accepted.</h1>
            <p style={{
              fontSize:'2rem'
              }}>A notification email with further instructions will be sent to <span style={{ color:'#fff' }}>{this.state.user.email}</span> in 24 hours.
            </p>
            <p style={{
              fontSize:'2rem',
              color: '#f34b4b'
              }}>REMINDER: 
              <br></br>
              Don't forget to add the wholesale % tag (WS-40 etc) in Shopify admin customer view to the newly created customer or the discount will not apply.
              <br></br>
              Also, if the customer has added a re-seller certificate to the application, please un-check "Collect tax" option in the Shopify admin customer view after confirming the certificate is valid.
            </p>
          </div>
          }
        </div>
      </div>
    )
  }
}