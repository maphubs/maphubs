//  @flow
import React from 'react';
import MapHubsPureComponent from '../MapHubsPureComponent';
import {addLocaleData, IntlProvider, FormattedNumber} from 'react-intl';
import turf_centroid from '@turf/centroid';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import fr from 'react-intl/locale-data/fr';
import it from 'react-intl/locale-data/it';
addLocaleData(en);
addLocaleData(es);
addLocaleData(fr);
addLocaleData(it);

type Props = {
  geojson?: Object
}

export default class FeatureLocation extends MapHubsPureComponent<Props, void> {
  render(){
    var centroid = turf_centroid(this.props.geojson);
    
    var utm = require('wgs84-util').LLtoUTM(centroid.geometry);

    var lon = centroid.geometry.coordinates[0];
    var lat = centroid.geometry.coordinates[1];
    return (
      <div className="row">
      <h5>{this.__('Location')}</h5>
      <div className="row no-margin">
        <span>
          <b>{this.__('Latitude:')}</b>&nbsp;
          <IntlProvider locale={this.state.locale}>
            <FormattedNumber value={lat}/>
          </IntlProvider>&nbsp;
        </span>
        <span>
          <b>{this.__('Longitude:')}</b>&nbsp;
          <IntlProvider locale={this.state.locale}>
            <FormattedNumber value={lon}/>
          </IntlProvider>&nbsp;
        </span>
      </div>
      <div className="row no-margin">
        <span>
          <b>{this.__('UTM:')}</b>&nbsp;
          {utm.properties.zoneNumber}{utm.properties.zoneLetter}&nbsp;
          <IntlProvider locale={this.state.locale}>
            <FormattedNumber value={utm.geometry.coordinates[0]}/>
          </IntlProvider>m E&nbsp;
          <IntlProvider locale={this.state.locale}>
            <FormattedNumber value={utm.geometry.coordinates[1]}/>
          </IntlProvider>m N
          </span>
      </div>
    </div>
    );
  }
}