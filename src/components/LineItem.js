import React, {Component} from 'react';
class LineItem extends Component {
  constructor(props) {
    super(props);

    this.decrementQuantity = this.decrementQuantity.bind(this);
    this.incrementQuantity = this.incrementQuantity.bind(this);
  }

  decrementQuantity(lineItemId) {
    this.props.updateLineItemInCart(lineItemId, this.props.line_item.quantity - 1)
  }

  incrementQuantity(lineItemId) {
    this.props.updateLineItemInCart(lineItemId, this.props.line_item.quantity + 1)
  }

  render() {
    const discount = this.props.discount[0].replace(/\D/g,'');
    const variant = this.props.line_item.variant;
    let variantPrice = variant.priceV2.amount;
    if (variant.presentmentPrices.edges[0].node.compareAtPrice === null) {
      variantPrice = variant.presentmentPrices.edges[0].node.price.amount;
    }
    if (variant.presentmentPrices.edges[0].node.compareAtPrice !== null 
      && variant.presentmentPrices.edges[0].node.compareAtPrice.amount > variantPrice) {
      variantPrice = variant.presentmentPrices.edges[0].node.compareAtPrice.amount;
    }
    let itemQuantity = () => {
      if (variant.sku === "150900" || variant.sku === "150910") {
        return this.props.line_item.quantity <= 6 ? this.props.line_item.quantity : this.props.removeLineItemInCart(this.props.line_item.id);
      }
      return this.props.line_item.quantity;
    };
    const price = (variantPrice * (1 - (discount / 100)));
    return (
      <li className="Line-item">
        <div className="Line-item__img">
          {this.props.line_item.variant.image ? <img src={this.props.line_item.variant.image.src} alt={`${this.props.line_item.title} product shot`}/> : null}
        </div>
        <div className="Line-item__content">
          <div className="Line-item__content-row">
            <span className="Line-item__title">
              {this.props.line_item.title}
            </span>
          </div>
          <div className="Line-item__content-row">
            <div className="Line-item__quantity-container">
              <button className="Line-item__quantity-update" onClick={() => this.decrementQuantity(this.props.line_item.id)}>-</button>
              <span className="Line-item__quantity">{itemQuantity()}</span>
              <button className="Line-item__quantity-update" onClick={() => this.incrementQuantity(this.props.line_item.id)}>+</button>
            </div>
            <span className="Line-item__price">
              $ {(this.props.line_item.quantity * price).toFixed(2)}
            </span>
            {(variant.product.productType.toUpperCase() !== 'MARKETING') && 
              <span className="Line-item__price Line-item__price_alt">
                MSRP $ { (this.props.line_item.quantity * variantPrice).toFixed(2) }
              </span>
            }
            <button className="Line-item__remove" onClick={()=> this.props.removeLineItemInCart(this.props.line_item.id)}>×</button>
          </div>
        </div>
      </li>
    );
  }
}

export default LineItem;
