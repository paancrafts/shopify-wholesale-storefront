import React from 'react';

export default function ApplicationSentPage(props) {
  return <div className="Apply-Form-page" style={{position:'relative'}}>
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
            <img style={{
              display: 'block', 
              margin: '0 auto 35px'
              }} src="" alt="" />
            <h1 style={{
              color:'center',
              padding:'0px 50px 25px'
              }}>Thank you for submitting your Wholesale Application.</h1>
            <p style={{
              fontSize:'2rem'
              }}>We’ll get back to you in 48 hours.
            <br></br>Check your email.</p>
          </div>
        </div>
}