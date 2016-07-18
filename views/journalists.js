var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');
var SubPageBanner = require('../components/Home/SubPageBanner');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var Journalists = React.createClass({

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
              img="/assets/home/Moabi-Forest.jpg"
               title={this.__('Mapping for Environmental Journalists')} subTitle={this.__(`
                   Add maps to your stories. We have the data.
                  `)} />
            <div className="container">
              <h4 lang="en">Data Support</h4>
              <h5 lang="en">Data Loading/Processing</h5>
              <p lang="en" style={{fontSize: '16px'}}>
                Not sure how to load your data into MapHubs?  We can help you get started. We’ll show you the ropes of how to load your data onto the platform, using existing data, and making a map or map story.
              </p>
            </div>
          </main>
          <Footer />
        </div>
      );


  }
});

module.exports = Journalists;
