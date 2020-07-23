import React, {Component} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RoundPriceToString from './RoundPriceToString';

import { Tooltip } from 'react-tippy';

class ProductFlexItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addedToCart: false
    };
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.handleQuantityChange = this.handleQuantityChange.bind(this);
    this.findImage = this.findImage.bind(this);
    this.handleAddToCart = this.handleAddToCart.bind(this);
  }

  componentWillMount() {
    this.props.product.options.forEach((selector) => {
      this.setState({
        selectedOptions: { [selector.name]: selector.values[0] }
      });
    });
  }

  findImage(images, variantId) {
    const primary = images[0];

    const image = images.filter(function (image) {
      return image.variant_ids.includes(variantId);
    })[0];

    return (image || primary).src;
  }

  handleAddToCart () {  
    this.setState({
      addedToCart: true
    });
  }

  handleOptionChange(event) {
    const target = event.target
    let selectedOptions = this.state.selectedOptions;
    selectedOptions[target.name] = target.value;

    const selectedVariant = this.props.product.variants.edges.find((variant) => {
      return variant.node.selectedOptions.every((selectedOption) => {
        return selectedOptions[selectedOption.name] === selectedOption.value;
      });
    }).node;

    this.setState({
      selectedVariant: selectedVariant,
      selectedVariantImage: selectedVariant.image.src
    });
  }

  handleQuantityChange(event) {
    this.setState({
      selectedVariantQuantity: event.target.value
    });
  }

  render() {
    let variantImage = this.state.selectedVariantImage || this.props.product.images.edges[0].node.src || 'product-placeholder.jpg';
    let variant = this.state.selectedVariant || this.props.product.variants.edges[0].node;
    let variantQuantity = this.state.selectedVariantQuantity || 1;
    let productTypeBoolean = this.props.product.productType.toUpperCase() === 'MARKETING';
    let discount = this.props.discount[0].replace(/\D/g,'');
    let variantPrice = variant.price;
    if (variant.presentmentPrices.edges[0].node.compareAtPrice === null) {
      variantPrice = variant.presentmentPrices.edges[0].node.price.amount;
    }
    if (variant.presentmentPrices.edges[0].node.compareAtPrice !== null 
      && variant.presentmentPrices.edges[0].node.compareAtPrice.amount > variant.price) {
      variantPrice = variant.presentmentPrices.edges[0].node.compareAtPrice.amount;
    }
    const price = (variantPrice * (1 - (discount / 100))).toFixed(3);
    return (
      <div className={this.props.product.vendor === this.props.selectedVendor ? 'Product' : 'Product hidden'}>
        {this.props.product.images.edges.length ? <img src={variantImage} alt={`${this.props.product.title} product shot`}/> : null}
        <h5 className="Product__title">{this.props.product.title}</h5>
        <Tooltip
          title={this.props.product.description}
          position="bottom"
          trigger="click"
          arrow="true"
          className="Product-description"
          animation="shift"
        >
          <FontAwesomeIcon icon={['fas', 'info-circle']} />
        </Tooltip>
        <span className="Product__price">$<RoundPriceToString value={price} decimals={3} /></span>
        {!productTypeBoolean && 
          <span style={{textAlign:'center', margin: '5px auto', display: 'block'}}>MSRP ${variantPrice}</span>
        }
        {productTypeBoolean && 
          <span style={{width: '100%', height:'12px', margin: '5px auto', display: 'block'}}>MSRP ${variantPrice}</span>
        }
        <label className="Product__option">
          Quantity:
          <input className="qty-input" aria-label="Quantity" min="1" type="number" defaultValue={variantQuantity} onChange={this.handleQuantityChange}></input>
        </label>
        <button className="Product__buy button" attr="Add-to-cart" onClick={() => {
          this.handleAddToCart();
          this.props.addVariantToCart(variant.id, variantQuantity, this.props.animation(variantQuantity));
        }}>
          { this.state.addedToCart ? <FontAwesomeIcon icon={['fas', 'check']} /> : 'ADD TO CART' }
        </button>
      </div>
    );
  }
}

export default ProductFlexItem;
