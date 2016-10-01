var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');
var SubPageBanner = require('../components/Home/SubPageBanner');
var IconRow = require('../components/Home/IconRow');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');
var config = require('../clientconfig');

var Services = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    locale: React.PropTypes.string.isRequired
  },

  render() {
      return (
        <div>
          <Header />
          <main style={{margin: 0}}>
            <SubPageBanner locale={this.props.locale}
              img="/assets/home/Moabi-Leaves.jpg"
               title={this.__('Services')} subTitle={config.productName + this.__(`
                    currently offers a range of service to help you get mapping.
                  `)} />
            <div className="container">
              <p lang="en" style={{fontSize: '18px', textAlign: 'center'}}>
                Contact us at: <a href="#" onClick={function(){HS.beacon.open();}}>{config.contactEmail}</a>
              </p>
              <h4 lang="en">Data Support</h4>

              <h5 lang="en">Data Loading, Processing, and Analysis</h5>
              <IconRow icon="cloud_upload">
                <p lang="en" style={{fontSize: '18px'}}>
                  Not sure how to load your data into {config.productName}?  We can help you get started. We’ll show you the ropes of how to load your data onto the platform, using existing data, and making a map or map story.
                </p>
              </IconRow>
              <IconRow icon="person_pin_circle">
                <p lang="en" style={{fontSize: '18px'}}>
                  Don’t have an in-house GIS data team? We can help you clean/convert/process, and analyze spatial data and load it into MapHubs.
                </p>
              </IconRow>

              <h5 lang="en">Raster Data Services</h5>
              <IconRow icon="image">
                <p lang="en" style={{fontSize: '18px'}}>
                  While MapHubs does not support uploading of raster data directly, we can setup and host raster services for an upfront fee plus small monthly hosting cost.  We can also help with processing raster data for display.
                </p>
              </IconRow>
              <IconRow icon="link">
                <p lang="en" style={{fontSize: '18px'}}>
                  MapHubs can also link to raster services hosted on ArcGIS Online, MapBox, Carto, GeoServer, etc. If you have an existing hosting platform, we can add it as MapHubs layers.
                </p>
              </IconRow>

              <h4 lang="en">Tech Support</h4>
              <IconRow icon="question_answer">
                <p lang="en" style={{fontSize: '18px'}}>
                  Have questions or need help? A tech support contract gives you priority access to our team. We can answer questions via email or chat with a guaranteed 24 hour or less response time, and if needed schedule a phone call or meeting to work with you in person.
                </p>
              </IconRow>

              <h4 lang="en">Training</h4>
              <IconRow icon="school">
                <p lang="en" style={{fontSize: '18px'}}>
                  Need help getting started with {config.productName}? We can support training sessions ranging from a 1-hour online call to on-site classroom training. We can train all abilities from experienced GIS specialists and web developers to novices who have never made an interactive map before. Through our partners at OSFAC (osfac.net), we can also offer on site training programs anywhere in the Central and West Africa in French.
                </p>
              </IconRow>

              <h4 lang="en">MapHubs On-Premise</h4>
              <IconRow icon="security">
                <p lang="en" style={{fontSize: '18px'}}>
                  Concerned about security or network bandwidth? MapHubs can be installed inside your organization’s firewall to host your data on your servers. Your MapHubs server will also give you direct access to all data hosted on the MapHubs.com
                </p>
              </IconRow>

              <h4 lang="en">Development Support</h4>
              <h5 lang="en">MapHubs Maps in Your Site</h5>
              <IconRow icon="extension">
                <p lang="en" style={{fontSize: '18px'}}>
                  MapHubs maps can be embedded in your website replacing the need for building and maintaining your own mapping system. We can help add maps to your site.
                  Note: During the MapHubs beta, maps can be embedded for free without a monthly fee. In the future, embedding may require a premium account for a small monthly fee. Contact us about discounts for early-adopters :)
                </p>
              </IconRow>

              <h5 lang="en">New Features / Improvements</h5>
              <IconRow icon="build">
                <p lang="en" style={{fontSize: '18px'}}>
                  We can build new features or make improvements to meet your needs. The MapHubs software is open-source and all custom development is shared with the open-source community.
                </p>
              </IconRow>
              <IconRow icon="lightbulb_outline">
                <p lang="en" style={{fontSize: '18px'}}>
                  Looking for ideas on what you can fund? Check out our GitHub issue tracker at
                  <a style={{
                      overflowWrap: 'break-word',
                      wordWrap: 'break-word'}}
                      href="https://github.com/maphubs/maphubs/issues">
                      https://github.com/maphubs/maphubs/issues
                  </a>
                </p>
              </IconRow>

              <p lang="en" style={{fontSize: '18px', textAlign: 'center'}}>
                Contact us at: <a href="#" onClick={function(){HS.beacon.open();}}>{config.contactEmail}</a>
              </p>
            </div>
          </main>
          <Footer />
        </div>
      );
  }
});

module.exports = Services;
