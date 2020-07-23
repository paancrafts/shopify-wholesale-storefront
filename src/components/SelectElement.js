import React, { Component } from 'react';
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
 
 
export default class SelectElement extends Component {
  constructor (props) {
    super(props);
    this.state = { 
      country: ''
    };
  }
 
  selectCountry (e) {
    this.setState({ country: e.target.value });
    this.props.selectCountry(e.target.value);
  }
  render () {
    const { country } = this.state;
    return (
      <div>
        <CountryDropdown
          value={country}
          onChange={(e) => this.selectCountry(e)}
          />
      </div>
    );
  }
}