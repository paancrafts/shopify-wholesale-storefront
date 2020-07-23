import React, { Component } from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import ApplyPage from './components/ApplyPage';
import ApplicationSentPage from './components/ApplicationSentPage';
import ApplicantConfirmPage from './components/ApplicantConfirm';
import ProductFlexItem from './components/ProductFlexItem';
import ProductListItem from './components/ProductListItem';
import Customer from './components/Customer';
import Cart from './components/Cart';
import CustomerAuthWithMutation from './components/CustomerAuth';
import PropTypes from 'prop-types';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import Headroom from 'react-headroom';
import {
  createCheckout,
  checkoutLineItemsAdd,
  checkoutLineItemsUpdate,
  checkoutLineItemsRemove,
  checkoutCustomerAssociate,
  checkoutShippingAddressUpdateV2,
  checkoutDiscountCodeApplyV2,
  addVariantToCart,
  updateLineItemInCart,
  removeLineItemInCart,
  associateCustomerCheckout,
  shippingAddressUpdate
} from './checkout';
import Footer from './components/Footer'
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle, faCartPlus, faShoppingCart, faCheck } from '@fortawesome/free-solid-svg-icons';
import 'react-tippy/dist/tippy.css';

library.add(faInfoCircle, faCartPlus, faShoppingCart, faCheck);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customerAccessToken: null,
      customer: null,
      discount: [],
      credit: null,
      animation: false,
      isCartOpen: false,
      listView: true,
      selectedVendor: '',
      isCustomerAuthOpen: true,
      productsSectionOpen: true,
      isNewCustomer: false,
      products: [],
      productsLoaded: false,
      vendorLogosNotActive: [
        { url: '',
          alt: ''
        },
        { url: '',
          alt: ''
        },
        { url: '',
          alt: ''
        }
      ],
      vendorLogosActive: [
        { url: '',
          alt: ''
        },
        { url: '',
          alt: ''
        },
        { url: '',
          alt: ''
        }
      ],
      checkout: { lineItems: { edges: [] } },
      itemsInCart: 0,
    };
    this.handleToken = this.handleToken.bind(this);
    this.handleCustomer = this.handleCustomer.bind(this);
    this.handleCartClose = this.handleCartClose.bind(this);
    this.handleCartOpen = this.handleCartOpen.bind(this);
    this.handleProductsClose = this.handleProductsClose.bind(this);
    this.handleProductsOpen = this.handleProductsOpen.bind(this);
    this.handleAnimation = this.handleAnimation.bind(this);
    this.addVariantToCart = addVariantToCart.bind(this);
    this.updateLineItemInCart = updateLineItemInCart.bind(this);
    this.removeLineItemInCart = removeLineItemInCart.bind(this);
    this.associateCustomerCheckout = associateCustomerCheckout.bind(this);
    this.createNewCheckout = this.createNewCheckout.bind(this);
    this.shippingAddressUpdate = shippingAddressUpdate.bind(this);
    this.reloadPage = this.reloadPage.bind(this);
    this.handleItemsInCart = this.handleItemsInCart.bind(this);
    this.loadProducts = this.loadProducts.bind(this);
  }
  componentWillMount() {
    this.props.createCheckout({
      variables: {
        input: {}
      }}).then((res) => {
      this.setState({
        checkout: res.data.checkoutCreate.checkout,
      });
    });
  }
  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool,
      error: PropTypes.object,
      shop: PropTypes.object,
    }).isRequired,
    createCheckout: PropTypes.func.isRequired,
    checkoutLineItemsAdd: PropTypes.func.isRequired,
    checkoutLineItemsUpdate: PropTypes.func.isRequired
  }

  handleToken(token) {
    this.setState({
      customerAccessToken: token,
    });
  }

  handleCustomer(customer) {
    this.setState({
      customer: customer
    })
  }

  handleCartOpen() {
    this.setState({
      isCartOpen: true,
    });
  }

  handleCartClose() {
    this.setState({
      isCartOpen: false,
    });
  }

  handleProductsOpen() {
    this.setState({
      productsSectionOpen: true,
    });
  }

  handleProductsClose() {
    this.setState({
      productsSectionOpen: false,
    });
  }

  handleItemsInCart (variantQuantity) {
    const cartItemsCount = Number(this.state.itemsInCart) + Number(variantQuantity);
    this.setState({
      itemsInCart: cartItemsCount,
    });
  }

  loadProducts () {
    const collections = this.props.data.shop.collections.edges;
    let products = [];
    for (let i = 0; i < collections.length; i++) {
      if (collections[i].node.title === ' Wholesale' || collections[i].node.title === 'RICH Wholesale') {
        let collectionProducts = collections[i].node.products.edges.forEach((product) => {
          products.push(product.node);
        });
        products.concat(collectionProducts);
      }
    }
    if (!this.state.productsLoaded) {
      this.setState({
        products: products,
        productsLoaded: true,
      });
    }
  }

  handleAnimation(variantQuantity) {
    this.handleItemsInCart(variantQuantity);
    this.setState({
      animation: true,
    });
    setTimeout(() => {
      this.setState({
        animation: false,
      });
    }, 1500);
  }

  createNewCheckout() {
    this.props.createCheckout({
      variables: {
        input: {}
    }}).then((res) => {
      this.setState({
        checkout: res.data.checkoutCreate.checkout
      });
      return this.state.customerAccessToken
    }).then( token => this.associateCustomerCheckout(token));
  }

  reloadPage() {
    window.location.reload(false); 
  }

  render() {
    if (this.props.data.error) {
      return <p>{this.props.data.error.message}</p>;
    }
    if (this.props.data.loading) {
      return <div style={{ position: 'relative', margin: '0', padding: '0', width: '100%', height: '100vh', background: '#000', textAlign: 'center'}}>
        <img src="loader.gif" style={{ position: 'absolute', margin: 'auto', top: '0', right: '0', bottom: '0', left: '0' }} alt=""></img>
      </div>;
    }

    const activeShadow = {
      WebkitBoxShadow: '0px 0px 7px 0px rgba(0,0,0,0.25)', 
      MozBoxShadow: '0px 0px 7px 0px rgba(0,0,0,0.25)',
      boxShadow: '0px 0px 7px 0px rgba(0,0,0,0.25)'
    };
    const noShadow = {
      WebkitBoxShadow: 'none', 
      MozBoxShadow: 'none',
      boxShadow: 'none'
    };
    
    return (
      <BrowserRouter>
        <div>
          <Route exact={true} path='/' render={() => (
            <div className="App">
            {this.state.isCustomerAuthOpen && 
              <CustomerAuthWithMutation
                handleToken={this.handleToken}
                closeCustomerAuth={this.closeCustomerAuth}
                isCustomerAuthOpen={this.state.isCustomerAuthOpen}
                newCustomer={this.state.isNewCustomer}
                associateCustomerCheckout={this.associateCustomerCheckout}
                showAccountVerificationMessage={this.showAccountVerificationMessage}
                loadProducts={this.loadProducts}
              />
            }
            {!this.state.isCustomerAuthOpen && 
            <div className="App_inner">
              {!this.state.isCartOpen &&
                <div className="App__view-cart-wrapper">
                  <button className={`App__view-cart ${this.state.animation ? 'App__view-cart-red' : ''}`}onClick={()=> this.setState({isCartOpen: true})}>
                  { this.state.animation && <span style={{marginRight:'8px'}}>Added to Cart </span> }
                  <FontAwesomeIcon icon={['fas', 'shopping-cart']} /> <span style={{marginLeft:'2px'}}>{this.state.itemsInCart}</span>
                  </button>
                </div>
              }
              <Headroom>
                <header className="App__header">
                  <div className="App__title">
                    <img style={{display: 'inline-block', marginBottom: '-26px'}} src=""  alt=" Logo" />
                  </div>
                  <div className="Store-nav">
                      <span className="Store-nav-btn" 
                        onClick={() => {
                            this.handleProductsClose()
                          }
                        }
                        style={!this.state.productsSectionOpen ? { color: '#b39a53' } : { color: '#fff' } }
                      >My account</span>
                      <span className="Store-nav-btn" 
                        onClick={() => {
                          this.handleProductsOpen()
                        }}
                        style={this.state.productsSectionOpen ? { color: '#b39a53' } : { color: '#fff' } }
                      >Products</span>
                      <span className="Store-nav-btn" 
                        onClick={() => {
                          this.reloadPage()
                        }}
                      >Log out</span>
                    </div>
                    
                </header>
              </Headroom>
              
            <Customer 
              customerAccessToken={this.state.customerAccessToken} 
              handleCustomer={this.handleCustomer}
              credit={this.state.credit}
              checkout={this.state.checkout}
              shippingAddressUpdate={this.shippingAddressUpdate}
              products={this.state.productsSectionOpen} 
              handleProductsOpen={this.handleProductsOpen} 
              handleProductsClose={this.handleProductsClose}
            />
            
            <div className={`Product-wrapper ${!this.state.productsSectionOpen ? 'Product-wrapper--closed' : ''}`}>
              <div className="Product-view-nav">
                <span className="Product-view-btn" onClick={()=> this.setState({selectedVendor: ''})}>
                  <img 
                  style={ this.state.selectedVendor === '' ? activeShadow : noShadow }
                  src={ this.state.vendorLogosNotActive[1].url } alt={this.state.vendorLogosNotActive[1].alt} />
                </span>
                <span className="Product-view-btn" onClick={()=> this.setState({selectedVendor: ''})}>
                  <img 
                  style={ this.state.selectedVendor === '' ? activeShadow : noShadow }
                  src={ this.state.vendorLogosNotActive[0].url } alt={this.state.vendorLogosNotActive[0].alt} />
                </span>
              </div>
              <div className="Product-view-nav">
                <span className="Product-view-btn" onClick={()=> this.setState({listView: false})}>
                  <img className="icons" style={this.state.listView ? {opacity: '0.25'} : {opacity: '1'}} src="" alt="Grid View icon" />
                </span>
                <span className="Product-view-btn" onClick={()=> this.setState({listView: true})}>
                  <img className="icons" style={!this.state.listView ? {opacity: '0.25'} : {opacity: '1'}} src="" alt="List View icon" />
                </span>
              </div>
              {this.state.listView && 
                <div className="Product-list-wrapper">
                  <table className="tg-wrap">
                    <tbody className="tg">
                      <tr>
                        <th className="tg-0lax"></th>
                        <th className="tg-0lax"></th>
                        <th className="tg-0lax">Price</th>
                        <th className="tg-0lax">Quantity</th>
                        <th className="tg-0lax">Add to Cart</th>
                      </tr>
                      {this.state.products.map((product) => {
                        return <ProductListItem 
                          discount={this.state.discount}
                          addVariantToCart={this.addVariantToCart} 
                          animation={this.handleAnimation}
                          checkout={this.state.checkout} 
                          key={product.id.toString()} 
                          product={product}
                          listView={this.state.listView}
                          selectedVendor={this.state.selectedVendor} />
                        })
                      }
                    </tbody>
                  </table>
                  {this.state.listView && 
                    <div style={{
                      marginTop: '75px'
                    }}>
                      <div className="Product-view-nav">
                        <span className="Product-view-btn" onClick={()=> this.setState({selectedVendor: ''})}>
                          <img 
                          style={ this.state.selectedVendor === '' ? activeShadow : noShadow }
                          src={ this.state.vendorLogosNotActive[1].url } alt={this.state.vendorLogosNotActive[1].alt} />
                        </span>
                        <span className="Product-view-btn" onClick={()=> this.setState({selectedVendor: ''})}>
                          <img 
                          style={ this.state.selectedVendor === '' ? activeShadow : noShadow }
                          src={ this.state.vendorLogosNotActive[0].url } alt={this.state.vendorLogosNotActive[0].alt} />
                        </span>
                      </div>
                      <div className="Product-view-nav">
                        <span className="Product-view-btn" onClick={()=> this.setState({listView: false})}>
                          <img className="icons" style={this.state.listView ? {opacity: '0.25'} : {opacity: '1'}} src="" alt="Grid View icon" />
                        </span>
                        <span className="Product-view-btn" onClick={()=> this.setState({listView: true})}>
                          <img className="icons" style={!this.state.listView ? {opacity: '0.25'} : {opacity: '1'}} src="" alt="List View icon" />
                        </span>
                      </div>
                    </div>
                  }
                </div>
              }
              {!this.state.listView 
                && this.state.products.map((product) => {
                  return <ProductFlexItem 
                    discount={this.state.discount}
                    addVariantToCart={this.addVariantToCart} 
                    animation={this.handleAnimation}
                    checkout={this.state.checkout} 
                    key={product.id.toString()} 
                    product={product} 
                    collections={this.props.data.shop.collections}
                    listView={this.state.listView}
                    selectedVendor={this.state.selectedVendor} />
                })
              }
            </div>
            {!this.state.listView && this.state.productsSectionOpen && 
              <div style={{
                marginTop: '75px'
              }}>
                <div className="Product-view-nav">
                  <span className="Product-view-btn" onClick={()=> this.setState({selectedVendor: ''})}>
                    <img 
                    style={ this.state.selectedVendor === '' ? activeShadow : noShadow }
                    src={ this.state.vendorLogosNotActive[1].url } alt={this.state.vendorLogosNotActive[1].alt} />
                  </span>
                  <span className="Product-view-btn" onClick={()=> this.setState({selectedVendor: ''})}>
                    <img 
                    style={ this.state.selectedVendor === '' ? activeShadow : noShadow }
                    src={ this.state.vendorLogosNotActive[0].url } alt={this.state.vendorLogosNotActive[0].alt} />
                  </span>
                </div>
                <div className="Product-view-nav">
                  <span className="Product-view-btn" onClick={()=> this.setState({listView: false})}>
                    <img className="icons" style={this.state.listView ? {opacity: '0.25'} : {opacity: '1'}} src="" alt="Grid View icon" />
                  </span>
                  <span className="Product-view-btn" onClick={()=> this.setState({listView: true})}>
                    <img className="icons" style={!this.state.listView ? {opacity: '0.25'} : {opacity: '1'}} src="" alt="List View icon" />
                  </span>
                </div>
              </div>
            }
            <Cart
              discount={this.state.discount}
              credit={this.state.credit}
              customer={this.state.customer}
              removeLineItemInCart={this.removeLineItemInCart}
              updateLineItemInCart={this.updateLineItemInCart}
              checkout={this.state.checkout}
              isCartOpen={this.state.isCartOpen}
              handleCartClose={this.handleCartClose}
              customerAccessToken={this.state.customerAccessToken}
              createNewCheckout={this.createNewCheckout}
              associateCustomerCheckout={this.associateCustomerCheckout}
              handleCartItemsCount={this.handleCartItemsCount}
            />
            <Footer />
            </div>
            }
          </div>
          )}/>
          <Route exact={true} path='/apply-for-wholesale-account' render={() => (
            <ApplyPage />
          )}/>
          <Route exact={true} path='/wholesale-application-sent' render={() => (
            <ApplicationSentPage />
          )}/>
          <Route path='/confirm/:user' component={ApplicantConfirmPage} />
        </div>
      </BrowserRouter>
    );
  }
}

const query = gql`
  query query {
    shop {
      name
      description
      collections (first: 100) {
        edges {
          node {
            id
            title
            products(first:100) {
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
              edges {
                node {
                  id
                  vendor
                  productType
                  title
                  description
                  descriptionHtml
                  options {
                    id
                    name
                    values
                  }
                  variants(first: 250) {
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                    }
                    edges {
                      node {
                        id
                        title
                        sku
                        selectedOptions {
                          name
                          value
                        }
                        image {
                          src
                        }
                        price
                        presentmentPrices (first: 100) {
                          edges {
                            node {
                              compareAtPrice
                              {amount}
                              price
                              {amount}
                            }
                          }
                        }
                      }
                    }
                  }
                  images(first: 250) {
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                    }
                    edges {
                      node {
                        src
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
`;

const AppWithDataAndMutation = compose(
  graphql(query),
  graphql(createCheckout, {name: "createCheckout"}),
  graphql(checkoutLineItemsAdd, {name: "checkoutLineItemsAdd"}),
  graphql(checkoutLineItemsUpdate, {name: "checkoutLineItemsUpdate"}),
  graphql(checkoutLineItemsRemove, {name: "checkoutLineItemsRemove"}),
  graphql(checkoutCustomerAssociate, {name: "checkoutCustomerAssociate"}),
  graphql(checkoutShippingAddressUpdateV2, {name: "checkoutShippingAddressUpdateV2"}),
  graphql(checkoutDiscountCodeApplyV2, {name: "checkoutDiscountCodeApplyV2"})
)(App);

export default AppWithDataAndMutation;
