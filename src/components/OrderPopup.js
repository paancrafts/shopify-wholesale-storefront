import React from 'react';
import Popup from 'reactjs-popup';

export default class OrderPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      open: false,
      order: null,
      discount: 0
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentWillMount() {
    this.setState({ 
      order: this.props.order,
      discount: Number(this.props.discount.replace(/\D/g,''))
    });
  }

  openModal() {
    if(this.state.order !== null) {
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
          View order details
        </button>
        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
        >
          <div className="modal">
            <a className="close-popup" onClick={this.closeModal}>
              &times;
            </a>
            <div style={{margin:'40px 0'}}>
              <span className="order-id-container">
                {this.state.order.node.name}
              </span>
              <span className="date-container">
                Order Date: {this.props.formatDate(this.state.order.node.processedAt)}
              </span>
            </div>
            {this.state.order !== null && 
            <div>
              <div className="order-popup-table">
                <h3>Ordered Items</h3>
                <div className="popup-order-list-items-headers">
                  <span style={{fontWeight:'bold'}}>SKU</span>
                  <span style={{fontWeight:'bold'}}>Product ID</span>
                  <span style={{fontWeight:'bold'}}>Qty</span>
                  <span style={{fontWeight:'bold'}}>Price</span>
                </div>
                {this.state.order.node.lineItems.edges.map((item, i) => 
                  <div className="popup-order-list-items" key={i + 1}>
                    <span className="item-sku">{item.node.variant.sku}</span>
                    <span>{item.node.title}</span>
                    <span className="item-qty">{item.node.quantity}</span>
                    <span className="item-price">${(item.node.variant.priceV2.amount - ((item.node.variant.priceV2.amount * this.state.discount) / 100)).toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <table className="tg-wrap order-popup-table">
                <tbody className="tg tg-popup-order-summary">
                  <tr>
                    <td className="tg-0lax">Sub Total</td>
                    <td className="tg-0lax">{`${(this.state.order.node.subtotalPriceV2.amount - this.state.order.node.totalTaxV2.amount).toFixed(2)} ${this.state.order.node.currencyCode}`}</td>
                  </tr>
                  <tr>
                    <td className="tg-0lax">Tax</td>
                    <td className="tg-0lax">{`${this.state.order.node.totalTaxV2.amount} ${this.state.order.node.currencyCode}`}</td>
                  </tr>
                  <tr>
                    <td className="tg-0lax">Shipping Cost</td>
                    <td className="tg-0lax">{`${this.state.order.node.totalShippingPriceV2.amount} ${this.state.order.node.currencyCode}`}</td>
                  </tr>
                  <tr>
                    <td className="tg-0lax" style={{fontWeight: 'bold', borderBottom: 'none'}}>Total Price</td>
                    <td className="tg-0lax" style={{fontWeight: 'bold', borderBottom: 'none'}}>{`${this.state.order.node.totalPriceV2.amount} ${this.state.order.node.currencyCode}`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            }
          </div>
        </Popup>
      </div>
    );
  }
}