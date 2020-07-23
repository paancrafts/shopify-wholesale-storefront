import React, {Component} from 'react';
import LineItem from './LineItem';

class Cart extends Component {

  constructor(props) {
    super(props);
    this.openCheckout = this.openCheckout.bind(this);
    this.sendDraftOrder = this.sendDraftOrder.bind(this);
    this.state = {
      sendDraftOrder: false
    };
  }

  openCheckout() {
    if (this.props.checkout.subtotalPrice === '0.00') {
      alert('Add something to cart!')
    } else {
      function base64ToAscii(encodedData) {
        const decoded = new Buffer.from(encodedData, 'base64').toString('ascii');
        return decoded;
      };
      const decodedId = base64ToAscii(this.props.checkout.id).slice(23).split('?key=');
      fetch('/api/confirmcheckout', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          key: decodedId[0]
        }), 
      })
      .then(res => res.json())
      .then(data => {
        if (data.checkoutCompleted) {
          alert(data.message)
          this.props.createNewCheckout();
        } else {
          alert(data.message)
          window.open(this.props.checkout.webUrl);
        }
      })
      .catch((err) => console.log(err))
    }
  }
  
  sendDraftOrder() {
    if (this.props.customerAccessToken) {
      if (this.props.checkout.subtotalPrice === '0.00') {
        alert('Add something to cart!')
      } else {
        this.setState({
          sendDraftOrder: true
        });
        fetch('/api/docreate', {
          method: 'POST', 
          mode: 'cors', 
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            cartData: this.props.checkout,
            customer: this.props.customer
          }), 
        })
        .then(res => {
          alert('Thank you! Your order has been submitted. Check your email for confirmation.');
          this.setState({
            sendDraftOrder: false
          });
          this.props.createNewCheckout();
        })
      }
    }
  }

  render() {
    let line_items = this.props.checkout.lineItems.edges.map((line_item) => {
      return (
        <LineItem
          discount={this.props.discount}
          removeLineItemInCart={this.props.removeLineItemInCart}
          updateLineItemInCart={this.props.updateLineItemInCart}
          key={line_item.node.id.toString()}
          line_item={line_item.node}
        />
      );
    });
    
    
    const CartNotificationStyles = {
      color: '#b39a53',
      fontWeight:'bold',
      textAlign:'center',
      fontSize:'1.3rem',
    };

    return (
      <div className={`Cart ${this.props.isCartOpen ? 'Cart--open' : ''}`}>
        <header className="Cart__header">
          <h2>RICH Shopping Cart</h2>
          
          <button
            onClick={this.props.handleCartClose}
            className="Cart__close">
            ×
          </button>
        </header>
        <ul className="Cart__line-items">
          {line_items}
        </ul>
        <footer className="Cart__footer">
          <div className="Cart-info clearfix">
            <div className="Cart-info__total Cart-info__small">Subtotal</div>
            <div className="Cart-info__pricing">
              <span className="pricing">$ {this.props.checkout.subtotalPrice}</span>
            </div>
          </div>
          <div className="Cart-info clearfix">
            <div className="Cart-info__total Cart-info__small">Taxes</div>
            <div className="Cart-info__pricing">
              <span className="pricing">$ {this.props.checkout.totalTax}</span>
            </div>
          </div>
          <div className="Cart-info clearfix">
            <div className="Cart-info__total Cart-info__small">Total</div>
            <div className="Cart-info__pricing">
              <span className="pricing">$ {this.props.checkout.totalPrice}</span>
            </div>
          </div>
          
          <div>
          {this.props.checkout.totalPrice < 99.00 && 
            <div style={{margin: '25px 0 5px'}}>
              <h3 style={CartNotificationStyles}>ADD ${(99.00 - this.props.checkout.totalPrice).toFixed(2).toString()} WORTH OF PRODUCTS TO SHOPPING CART TO UNLOCK FREE SHIPPING.</h3>
            </div>
            }
            {this.props.checkout.totalPrice >= 99.00 && 
            <div style={{margin: '25px 0 5px'}}>
              <h3 style={CartNotificationStyles}>THIS ORDER IS ELIGIBLE FOR FREE SHIPPING.</h3>
            </div>
            }
            <button className="Cart__checkout button" onClick={this.openCheckout}>
            {this.props.credit !== null && this.props.credit.length > 0 ? 'Instant Payment' : 'Checkout'}
            </button>
            
            {this.props.credit !== null && this.props.credit.length > 0 &&
              <button id="Cart__draft_order" className="Cart__checkout button" onClick={this.sendDraftOrder}>{!this.state.sendDraftOrder ? 'Submit Order' : 'Submitting...'}</button>
          }
          </div>
        </footer>
      </div>
    )
  }
}

export default Cart;
