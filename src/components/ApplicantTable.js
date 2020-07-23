function ApplicantDataTable (props) {
  return `
    <table>
      <tbody>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">Salon/Barbershop/Shop Name:</span></td>
          <td>${props.storeName}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">Social Media Handles:</span></td>
          <td>${props.socialMediaHandles}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">Business Name:</span></td>
          <td>${props.businessName}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">Professional Licence No:</span></td>
          <td>${props.licence}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">Name:</span></td>
          <td>${props.firstName} ${props.lastName}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">Email:</span></td>
          <td>${props.email}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">Phone:</span></td>
          <td>${props.phone}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">Address Line 1:</span></td>
          <td>${props.addressLine1}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">Address Line 2:</span></td>
          <td>${props.addressLine2}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">City:</span></td>
          <td>${props.city}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">State:</span></td>
          <td>${props.state}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">ZIP/Postal Code:</span></td>
          <td>${props.zip}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">Country:</span></td>
          <td>${props.country}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">Additional Info:</span></td>
          <td>${props.message}</td>
        </tr>
        <tr>
          <td><span style="font-weight:bold;padding:5px;">Re-seller certificate (optional):</span></td>
          <td>${props.uploadedFileName || ''}</td>
        </tr>
      </tbody>
    </table>
  `
}

module.exports = ApplicantDataTable; 