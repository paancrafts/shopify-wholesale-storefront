import React from 'react';

export default function Footer () {
  const year = new Date().getFullYear();
  return <div 
    style={{
      width: '100%',
      position:'fixed',
      bottom:'0',
      padding:'8px',
      margin: '0',
      textAlign:'center',
      color:'#1A1A1A',
      background:'#a78d45'
    }}><h5 style={{margin:'0'}}>&copy;{year} - Demo Business</h5></div>
}