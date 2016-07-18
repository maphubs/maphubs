var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');
var SubPageBanner = require('../components/Home/SubPageBanner');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

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
               title={this.__('Services')} subTitle={this.__(`
                   MapHubs currently offers a range of service to help you get mapping.
                  `)} />
            <div className="container">
              <p lang="en" style={{fontSize: '18px', textAlign: 'center'}}>
                Contact us at: <a href="mailto:support@maphubs.com">support@maphubs.com</a>
              </p>
              <h4 lang="en">Data Support</h4>
              <h5 lang="en">Data Loading/Processing</h5>
              <div className="row valign-wrapper">
                <div className="col s12 m2 center-align valign">
                    <i className="material-icons omh-accent-text" style={{fontSize: '80px'}}>cloud_upload</i>
                </div>
                <div className="col s12 m10">
                  <p lang="en" style={{fontSize: '18px'}}>
                    Not sure how to load your data into MapHubs?  We can help you get started. We’ll show you the ropes of how to load your data onto the platform, using existing data, and making a map or map story.
                  </p>
                </div>
              </div>
              <div className="row valign-wrapper">
                <div className="col s12 m2 center-align valign">
                  <i className="material-icons omh-accent-text" style={{fontSize: '80px'}}>person_pin_circle</i>
                </div>
                <div className="col s12 m10">
                  <p lang="en" style={{fontSize: '18px'}}>
                    Don’t have an in-house GIS data team? We can help you clean/convert/process spatial data and get it into MapHubs.
                  </p>
                </div>
              </div>

              <h5 lang="en">Raster Data Services</h5>
                <div className="row valign-wrapper">
                  <div className="col s12 m2 center-align valign">
                    <i className="material-icons omh-accent-text" style={{fontSize: '80px'}}>image</i>
                  </div>
                  <div className="col s12 m10">
                    <p lang="en" style={{fontSize: '18px'}}>
                      While MapHubs does not support uploading of raster data directly, we can setup and host raster services for an upfront fee plus small monthly hosting cost.  We can also help with processing raster data for display.
                    </p>
                  </div>
                </div>

              <div className="row valign-wrapper">
                <div className="col s12 m2 center-align valign">
                  <i className="material-icons omh-accent-text" style={{fontSize: '80px'}}>link</i>
                </div>
                <div className="col s12 m10">
                  <p lang="en" style={{fontSize: '18px'}}>
                    MapHubs can also link to raster services hosted on ArcGIS Online, MapBox, Carto, GeoServer, etc. If you have an existing hosting platform we can add it as MapHubs layers.
                  </p>
                </div>
              </div>

              <h4 lang="en">Tech Support</h4>
                <div className="row valign-wrapper">
                  <div className="col s12 m2 center-align valign">
                    <i className="material-icons omh-accent-text" style={{fontSize: '80px'}}>question_answer</i>
                  </div>
                  <div className="col s12 m10">
                    <p lang="en" style={{fontSize: '18px'}}>
                      Have questions or need help? A tech support contract gives you priority access to our team. We can answer questions via email or chat with a guaranteed 24 hour or less response time, and if needed schedule a phone call or meeting to work with you in person.
                    </p>
                  </div>
                </div>
              <h4 lang="en">Training</h4>
                <div className="row valign-wrapper">
                  <div className="col s12 m2 center-align valign">
                    <i className="material-icons omh-accent-text" style={{fontSize: '80px'}}>school</i>
                  </div>
                  <div className="col s12 m10">
                    <p lang="en" style={{fontSize: '18px'}}>
                      Need help getting started with MapHubs? We can support training sessions ranging from a 1-hour online call, to on-site classroom training.
                    </p>
                  </div>
                </div>
              <h4 lang="en">MapHubs On-Premise</h4>
                <div className="row valign-wrapper">
                  <div className="col s12 m2 center-align valign">
                     <i className="material-icons omh-accent-text" style={{fontSize: '80px'}}>security</i>
                  </div>
                  <div className="col s12 m10">
                    <p lang="en" style={{fontSize: '18px'}}>
                      Concerned about security or network bandwidth? MapHubs can be installed inside your organization’s firewall to host your data on your servers.
                    </p>
                  </div>
                </div>
              <h4 lang="en">Development Support</h4>
              <h5 lang="en">MapHubs Maps in Your Site</h5>
                <div className="row valign-wrapper">
                  <div className="col s12 m2 center-align valign">
                    <i className="material-icons omh-accent-text" style={{fontSize: '80px'}}>extension</i>
                  </div>
                  <div className="col s12 m10">
                    <p lang="en" style={{fontSize: '18px'}}>
                      MapHubs maps can be embedded in your website replacing the need for building and maintaining your own mapping system. We can help add maps to your site.
                      Note: During the MapHubs beta, maps can be embedded for free without a monthly fee. In the future, embedding may require a premium account for a small monthly fee. Contact us about discounts for early-adopters :)
                    </p>
                  </div>
                </div>
              <h5 lang="en">New Features / Improvements</h5>
                <div className="row valign-wrapper">
                  <div className="col s12 m2 center-align valign">
                    <i className="material-icons omh-accent-text" style={{fontSize: '80px'}}>build</i>
                  </div>
                  <div className="col s12 m10">
                    <p lang="en" style={{fontSize: '18px'}}>
                      We can build new features or make improvements to meet your needs. The MapHubs software is open-source and all custom development is shared with the open-source community.
                    </p>
                  </div>
                </div>

              <div className="row valign-wrapper">
                <div className="col s12 m2 center-align valign">
                  <i className="material-icons omh-accent-text" style={{fontSize: '80px'}}>lightbulb_outline</i>
                </div>
                <div className="col s12 m10">
                  <p lang="en" style={{fontSize: '18px'}}>
                    Looking for ideas on what you can fund? Check out our GitHub issue tracker at <a href="https://github.com/maphubs/maphubs/issues">https://github.com/maphubs/maphubs/issues</a>
                  </p>
                </div>
              </div>
              <p lang="en" style={{fontSize: '18px', textAlign: 'center'}}>
                Contact us at: <a href="mailto:support@maphubs.com">support@maphubs.com</a>
              </p>
            </div>
          </main>
          <Footer />
        </div>
      );
  }
});

module.exports = Services;
