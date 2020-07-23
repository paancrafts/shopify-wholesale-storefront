import gql from 'graphql-tag';

const CheckoutFragment = gql`
  fragment CheckoutFragment on Checkout {
    id
    webUrl
    totalTax
    subtotalPrice
    totalPrice
    discountApplications (first: 10) {
      edges {
        node {
          allocationMethod
          targetSelection
          targetType
          value
        }
      }
    }
    shippingAddress {
      firstName
      lastName
      company
      address1
      address2
      city 
      province
      country
      phone
    }
    lineItems (first: 250) {
      edges {
        node {
          id
          title
          quantity
          variant {
            id
            sku
            title
            product {
              productType
            }
            priceV2 {
              amount
            }
            presentmentPrices (first: 10) {
              edges {
                node {
                  compareAtPrice {
                    amount
                  }
                  price {
                    amount
                  }
                }
              }
            }
            image {
              src
            }
          }
        }
      }
    }
  }
`;

export const createCheckout = gql`
  mutation checkoutCreate ($input: CheckoutCreateInput!){
    checkoutCreate(input: $input) {
      userErrors {
        message
        field
      }
      checkout {
        ...CheckoutFragment
      }
    }
  }
  ${CheckoutFragment}
`;

export const checkoutLineItemsAdd = gql`
  mutation checkoutLineItemsAdd ($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
    checkoutLineItemsAdd(checkoutId: $checkoutId, lineItems: $lineItems) {
      userErrors {
        message
        field
      }
      checkout {
        ...CheckoutFragment
      }
    }
  }
  ${CheckoutFragment}
`;

export const checkoutLineItemsUpdate = gql`
  mutation checkoutLineItemsUpdate ($checkoutId: ID!, $lineItems: [CheckoutLineItemUpdateInput!]!) {
    checkoutLineItemsUpdate(checkoutId: $checkoutId, lineItems: $lineItems) {
      userErrors {
        message
        field
      }
      checkout {
        ...CheckoutFragment
      }
    }
  }
  ${CheckoutFragment}
`;

export const checkoutLineItemsRemove = gql`
  mutation checkoutLineItemsRemove ($checkoutId: ID!, $lineItemIds: [ID!]!) {
    checkoutLineItemsRemove(checkoutId: $checkoutId, lineItemIds: $lineItemIds) {
      userErrors {
        message
        field
      }
      checkout {
        ...CheckoutFragment
      }
    }
  }
  ${CheckoutFragment}
`;

export const checkoutCustomerAssociate = gql`
  mutation checkoutCustomerAssociate($checkoutId: ID!, $customerAccessToken: String!) {
    checkoutCustomerAssociate(checkoutId: $checkoutId, customerAccessToken: $customerAccessToken) {
      userErrors {
        field
        message
      }
      checkout {
        ...CheckoutFragment
      }
      customer {
        id
        email
        firstName
        lastName
        acceptsMarketing
        tags
        addresses(first:10 reverse:true){
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
        defaultAddress {
          firstName
          lastName
          company
          address1
          address2
          city
          province
          zip
          country
          phone
        }
      }
    }
  }
  ${CheckoutFragment}
`;
export const checkoutShippingAddressUpdateV2 = gql`
  mutation checkoutShippingAddressUpdateV2($shippingAddress: MailingAddressInput!, $checkoutId: ID!) {
    checkoutShippingAddressUpdateV2(shippingAddress: $shippingAddress, checkoutId: $checkoutId) {
      checkout {
        ...CheckoutFragment
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
  ${CheckoutFragment}
`;
export const checkoutDiscountCodeApplyV2 = gql`
  mutation checkoutDiscountCodeApplyV2($discountCode: String!, $checkoutId: ID!) {
    checkoutDiscountCodeApplyV2(discountCode: $discountCode, checkoutId: $checkoutId) {
      checkout {
        ...CheckoutFragment
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
  ${CheckoutFragment}
`;
export function addVariantToCart(variantId, quantity, callback){

  this.props.checkoutLineItemsAdd(
    { variables: { checkoutId: this.state.checkout.id, lineItems:  [{variantId, quantity: parseInt(quantity, 10)}] }
    }).then(() => {
      
    this.props.checkoutDiscountCodeApplyV2({ 
      variables: { 
        discountCode: this.state.discount[0], 
        checkoutId: this.state.checkout.id }
      })
      .then((res) =>  {
        this.setState({
          checkout: res.data.checkoutDiscountCodeApplyV2.checkout
        });
      })
      .catch(err => console.log('DiscountCodeApply: ', err));
    
  }).catch(err => {
    console.log(err)
    alert('A checkout with the same ID has already been completed. Log out to start a new session')
  });
}

export function updateLineItemInCart(lineItemId, quantity){
  this.props.checkoutLineItemsUpdate(
    { variables: { checkoutId: this.state.checkout.id, lineItems: [{id: lineItemId, quantity: parseInt(quantity, 10)}] }
    }).then((res) => {
      let itemsInCart = 0;
      res.data.checkoutLineItemsUpdate.checkout.lineItems.edges.map((item) => {
        itemsInCart = itemsInCart + item.node.quantity;
        return itemsInCart;
      });
      this.setState({
        checkout: res.data.checkoutLineItemsUpdate.checkout,
        itemsInCart: itemsInCart,
      });
  })
  .catch(err => {
    alert('A checkout with the same ID has already been completed. Log out to start a new session')
  });
}

export function removeLineItemInCart(lineItemId){
  this.props.checkoutLineItemsRemove(
    { variables: { checkoutId: this.state.checkout.id, lineItemIds: [lineItemId] }
    })
    .then((res) => {
      let itemsInCart = 0;
      res.data.checkoutLineItemsRemove.checkout.lineItems.edges.map((item) => {
        itemsInCart = itemsInCart + item.node.quantity;
        return itemsInCart;
      });
      this.setState({
        checkout: res.data.checkoutLineItemsRemove.checkout,
        itemsInCart: itemsInCart,
      });
    })
    .catch(err => {
      alert('A checkout with the same ID has already been completed. Log out to start a new session')
  });
}

export function associateCustomerCheckout(customerAccessToken){
  this.props.checkoutCustomerAssociate(
    { variables: { checkoutId: this.state.checkout.id, customerAccessToken: customerAccessToken }
    }).then((res) => {
      this.setState({
        checkout: res.data.checkoutCustomerAssociate.checkout,
        isCustomerAuthOpen: false
      });
      return { 
        customer: res.data.checkoutCustomerAssociate.customer,
        shippingAddress: {
          company: res.data.checkoutCustomerAssociate.customer.defaultAddress.company,
          firstName: res.data.checkoutCustomerAssociate.customer.defaultAddress.firstName,
          lastName: res.data.checkoutCustomerAssociate.customer.defaultAddress.lastName,
          phone: res.data.checkoutCustomerAssociate.customer.defaultAddress.phone,
          address1: res.data.checkoutCustomerAssociate.customer.defaultAddress.address1,
          address2: res.data.checkoutCustomerAssociate.customer.defaultAddress.address2,
          city: res.data.checkoutCustomerAssociate.customer.defaultAddress.city,
          province: res.data.checkoutCustomerAssociate.customer.defaultAddress.province,
          zip: res.data.checkoutCustomerAssociate.customer.defaultAddress.zip,
          country: res.data.checkoutCustomerAssociate.customer.defaultAddress.country,
        }, 
        checkoutId: res.data.checkoutCustomerAssociate.checkout.id
      };
  }).then((res) => {
    const discountTag = res.customer.tags.filter(tag => tag.includes('WS-'));
    const creditTag = res.customer.tags.filter(tag => tag.includes('NET-'));
    this.setState({
      customer: res.customer,
      discount: discountTag,
      credit: creditTag
    })
    this.props.checkoutShippingAddressUpdateV2({ 
    variables: { 
      shippingAddress: res.shippingAddress, 
      checkoutId: res.checkoutId }
    })
    .then(() => {})
    .catch(err => console.log('ShippingAddressUpdate: ', err));
  })
  .catch(err => console.log(err));
}
 
export function shippingAddressUpdate(shippingAddress, checkoutId){
  this.props.checkoutShippingAddressUpdateV2(
    { variables: { shippingAddress: shippingAddress, checkoutId: checkoutId }
    }).then(() => {});
}