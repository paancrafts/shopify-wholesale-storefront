import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import OrderPopup from './OrderPopup';
import EditAddressPopup from './EditAddress';
import ChangePassPopup from './ChangePassword';

export default class Customer extends Component {
  constructor(props) {
    super(props)

    this.state = { 
      customerAccessToken: props.customerAccessToken,
      loading: true,
      loadingDrafts: true,
      loadingAddress: true,
      draftOrders: null,
      defaultAddress: null
    };

    this.addDays = this.addDays.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.getDraftOrders = this.getDraftOrders.bind(this);
    this.getDefaultAddress = this.getDefaultAddress.bind(this);
    this.editCustomerDefaultAddress = this.editCustomerDefaultAddress.bind(this);
  }
  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  formatDate(string){
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(string).toLocaleDateString([],options);
  }
  getDraftOrders(customerId) {
    fetch('/api/dolist', {
      method: 'POST', 
      mode: 'cors', 
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        customerId: customerId
      }), 
    })
    .then(response => response.json())
    .then(draftOrders => {
      if (this.state.loadingDrafts.length > 0) {
        const allDraftOrders = draftOrders.map(order => {
          return order
        });
        const notCompletedDraftOrders = allDraftOrders.filter(order => order.completed_at === null)
        this.setState({
          loadingDrafts: false,
          draftOrders: notCompletedDraftOrders
        })
        return false;
      }
    }
    )
    .catch((err) => console.log(err))
  }
  getDefaultAddress(customerId, addressId) {
    fetch('/api/getdefaultaddress', {
      method: 'POST', 
      mode: 'cors',
      headers: {
          'Content-Type': 'application/json',
      },
      
      body: JSON.stringify({ 
        customerId: customerId,
        addressId: addressId,
      }), 
    })
    .then(response => response.json())
    .then(address => {
      this.setState({
        loadingAddress: false,
        defaultAddress: address
      })
      return false;
    })
    .catch((err) => console.log(err))
  }
  editCustomerDefaultAddress(customerId, addressId, params) {
    fetch('/api/editdefaultaddress', {
      method: 'PUT', 
      mode: 'cors',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        customerId: customerId,
        addressId: addressId,
        params: params
      }), 
    })
    .then(response => response.json())
    .then(address => {
      this.setState({
        loadingAddress: false,
        defaultAddress: address
      });
      this.props.shippingAddressUpdate(
        {
          address1: address.address1,
          address2: address.address2,
          city: address.city,
          company: address.company,
          country: address.country,
          firstName: address.first_name,
          lastName: address.last_name,
          phone: address.phone,
          province: address.province,
          zip: address.zip,
        }, 
        this.props.checkout.id);
      return false;
    })
    .catch((err) => console.log(err));
  }
  changePwd(customerId, params) {
    fetch('/api/changepwd', {
      method: 'POST', 
      mode: 'cors',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        customerId: customerId,
        params: params
      }), 
    })
    .then(res => res.json())
    .then((data) => {
      if (data.statusCode === 422) {
        alert('Password not saved. Minimum password length is 5 letters')
      }
      if (data.statusCode === 200) {
        alert('Password has been changed')
      }
    })
    .catch((err) => console.log(err))
  }
  render() {
    return (
      <Query query={customerQuery} variables={{customerAccessToken: this.state.customerAccessToken}}>
        {({ loading, error, data }) => {
          if (error) console.log(`Error! ${error.message}`)
          if (data) {
            if(data.customer  && this.state.loadingAddress) {
              this.getDefaultAddress(data.customer.id, data.customer.defaultAddress.id)
            }
            if(data.customer && this.state.loadingDrafts) {
              this.getDraftOrders(data.customer.id);
              
            }
          return (
            <div>
              <section className="Customer-wrapper">
                {!this.props.products && 
                  this.state.defaultAddress !== null && 
                  <div className="Customer-details flex-container">
                    <div className="details-block">
                      <h2>Shipping Address</h2>
                      <p>{this.state.defaultAddress.company}</p>
                      <p>{`${this.state.defaultAddress.first_name} ${this.state.defaultAddress.last_name}`}</p>
                      <p>{`${this.state.defaultAddress.address1} ${this.state.defaultAddress.address2}`}</p>
                      <p>{`${this.state.defaultAddress.city} ${this.state.defaultAddress.zip}`}</p>
                      <p>{`${this.state.defaultAddress.province}, ${this.state.defaultAddress.country}`}</p>
                      <p>{`${this.state.defaultAddress.phone}`}</p>
                      <EditAddressPopup  
                        customerId={data.customer.id}
                        defaultAddress={this.state.defaultAddress}
                        editDefaultAddress={this.editCustomerDefaultAddress} />
                      <ChangePassPopup 
                        customerId={data.customer.id}
                        changePwd={this.changePwd} /> 
                    </div>
                    <div className="details-block">
                      {data.customer.tags.filter((tag) => tag.includes('WS-')).length > 0 
                        ? <div style={{marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #000'}}>
                            <h2>Wholesale Program</h2>
                            <h3>
                              {data.customer.tags.filter((tag) => tag.includes('WS-'))} activated
                            </h3>
                          </div>
                        : <p></p>
                      }
                      <div>
                      
                      {data.customer.tags.filter((tag) => tag.includes('NET-')).length > 0 
                        ? <div>
                            <h2>Credit Terms</h2>
                            <h3>
                              {data.customer.tags.filter((tag) => tag.includes('NET-'))} activated
                            </h3>
                          </div>
                        : <p></p>
                        }
                        </div>
                      {/* } */}
                    </div>
                  </div>
                }
              </section>
              <section className="Last-checkout-wrapper">
                {!this.props.products && 
                 !this.state.loadingDrafts &&
                 this.state.draftOrders.length > 0 &&
                  <div className="flex-container">
                    <div className="unpaid-orders-container">
                      <h2>Unpaid Orders with Credit Terms</h2>
                      {this.state.draftOrders.length > 0 &&
                      <table className="tg-wrap">
                        <tbody className="tg">
                          <tr>
                            <th className="tg-0lax">Order ID</th>
                            <th className="tg-0lax">Date</th>
                            <th className="tg-0lax">Due Date</th>
                            <th className="tg-0lax">Sub Total</th>
                            <th className="tg-0lax">Tax</th>
                            <th className="tg-0lax">Total Price</th>
                            <th className="tg-0lax">Payment Link</th>
                          </tr>
                        {!this.props.products && 
                          data.customer && 
                          this.state.draftOrders.map(order =>
                            <tr key={order.id}>
                              <td className="tg-0lax">{order.name}</td>
                              <td className="tg-0lax">{this.formatDate(order.created_at)}</td>
                              <td className="tg-0lax">{this.formatDate(new Date(this.addDays(order.created_at, Number(data.customer.tags.filter((tag) => tag.includes('NET-'))[0].replace(/\D/g,'')))))}</td>
                              <td className="tg-0lax">{`${(order.subtotal_price - order.total_tax).toFixed(2)} ${order.currency}`}</td>
                              <td className="tg-0lax">{`${order.total_tax} ${order.currency}`}</td>
                              <td className="tg-0lax">{`${order.total_price} ${order.currency}`}</td>
                              <td className="tg-0lax"><a href={order.invoice_url} target="_blank"><button className="button">Submit payment</button></a></td>
                            </tr>
                          )
                        }
                        </tbody>
                      </table>
                      }
                    </div>
                  </div>
                }
              </section>
              {!this.props.products && 
                data.customer.orders.edges.length > 0 && 
                <section className="Orders-wrapper">
                  <h2>Order History</h2>
                  <table className="tg-wrap">
                    <tbody className="tg">
                      <tr>
                        <th className="tg-0lax">Order ID</th>
                        <th className="tg-0lax">Date</th>
                        <th className="tg-0lax">Sub Total</th>
                        <th className="tg-0lax">Tax</th>
                        <th className="tg-0lax">Shipping</th>
                        <th className="tg-0lax">Total</th>
                        <th className="tg-0lax">Order Summary</th>
                      </tr>
                    {data.customer.orders.edges.map(order =>
                        <tr key={order.node.orderNumber}>
                          <td className="tg-0lax">{order.node.name}</td>
                          <td className="tg-0lax">{this.formatDate(order.node.processedAt)}</td>
                          <td className="tg-0lax">{`${(order.node.subtotalPriceV2.amount - order.node.totalTaxV2.amount).toFixed(2)} ${order.node.currencyCode}`}</td>
                          <td className="tg-0lax">{`${order.node.totalTaxV2.amount} ${order.node.currencyCode}`}</td>
                          <td className="tg-0lax">{`${order.node.totalShippingPriceV2.amount} ${order.node.currencyCode}`}</td>
                          <td className="tg-0lax">{`${order.node.totalPriceV2.amount} ${order.node.currencyCode}`}</td>
                          <td className="tg-0lax">
                            <OrderPopup 
                              discount={data.customer.tags.find(tag => tag = tag.includes('WS-'))} 
                              formatDate={this.formatDate} 
                              id={order.node.orderNumber} 
                              order={order} />
                          </td>
                        </tr>
                      )
                    }
                    </tbody>
                  </table>
                </section>
              }
            </div>
          );
          }
        }}
      </Query>
    );
  }
}

const customerQuery = gql`
  query customer($customerAccessToken: String!){
    customer(customerAccessToken: $customerAccessToken) {
      id
      tags
      firstName
      lastName
      email
      tags
      acceptsMarketing
      defaultAddress {
        id
        company
        address1
        address2
        city
        province
        provinceCode
        zip
        country
        phone
      }
      addresses(first: 5) {
        edges{
          node{
            company
            firstName
            lastName
            phone
            address1
            address2
            city
            province
            zip
            country
            
          }
        }
      }
      orders(first: 100 reverse: true) {
        edges{
          node{
            name
            orderNumber
            processedAt
            currencyCode
            subtotalPriceV2{
              amount
            }
            totalShippingPriceV2{
              amount
            }
            totalTaxV2{
              amount
              currencyCode
            }
            totalPriceV2{
              amount
            }
            statusUrl
            lineItems(first: 128) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                    sku
                    weight
                    weightUnit
                    product {
                      vendor
                      tags
                      images(first:5) {
                        edges {
                          node {
                            transformedSrc(maxWidth:150)
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      lastIncompleteCheckout{
        id
        createdAt
        orderStatusUrl
        webUrl
        currencyCode
        subtotalPriceV2{
          amount
        }
        shippingLine{
          title
          priceV2{
            amount
          }
        }
        totalTaxV2 {
          amount
        }
        totalPriceV2{
          amount
        }
        lineItems(first: 15 reverse: true){
          edges{
            node{
              id
              title
              variant{
                sku
                title
                image{
                  altText
                  transformedSrc(maxHeight:200)
                }
              }
            }
          }
        }
      }
    }
  }
`;