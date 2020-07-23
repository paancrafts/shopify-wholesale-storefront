import React, {Component} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from 'react-tippy';
import RoundPriceToString from './RoundPriceToString';

class ProductListItem extends Component {
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
    let discount = this.props.discount[0] ? this.props.discount[0].replace(/\D/g,'') : 0;
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
      <tr id={this.props.product.id} className={this.props.product.vendor === this.props.selectedVendor ? '' : 'hidden'}>
        <td className="tg-0lax">
        <Tooltip
          html={this.props.product.images.edges.length ? <img src={variantImage} alt={`${this.props.product.title} product shot`}/> : null}
          position="bottom"
          trigger="click"
          arrow="true"
          className="Product-image-tooltip"
          animation="shift"
        >
          {this.props.product.images.edges.length ? <img src={variantImage} alt={`${this.props.product.title} product shot`}/> : null}
        </Tooltip>
          
        </td>
        <td className="tg-0lax">
          <h5 className="Product-title">
            {this.props.product.title}
          </h5>
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
        </td>
        <td className="tg-0lax">
          <span className="Product__price">$<RoundPriceToString value={price} decimals={3} /></span>
          <br></br>
          {!productTypeBoolean && 
            <span style={{textAlign:'center',fontSize:'85%',display:'block',padding:'0 20px',margin:'0 auto'}}>MSRP ${variantPrice}</span>
          }
        </td>
        <td className="tg-0lax">
          <label className="">
            <input className="qty-input" aria-label="Quantity" min="1" type="number" defaultValue={variantQuantity} onChange={this.handleQuantityChange}></input>
          </label>
        </td>
        <td className="tg-0lax">
          <button id={variant.id} className="list-add-to-cart button" 
            onClick={() => {
              this.props.addVariantToCart(variant.id, variantQuantity, price, this.props.animation(variantQuantity));
              this.handleAddToCart();
            }}>
            { this.state.addedToCart ? <FontAwesomeIcon icon={['fas', 'check']} /> : <FontAwesomeIcon icon={['fas', 'cart-plus']} /> }
          </button>
        </td>
      </tr>
    );
  }
}

export default ProductListItem;
