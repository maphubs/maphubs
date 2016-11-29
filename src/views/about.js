// @flow
var React = require('react');

var Header = require('../components/header');
var Footer = require('../components/footer');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var SubPageBanner = require('../components/Home/SubPageBanner');

var About = React.createClass({

  mixins:[StateMixin.connect(LocaleStore, {initWithProps: ['locale', '_csrf']})],

  __(text: string){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    locale: React.PropTypes.string.isRequired,
    version: React.PropTypes.string
  },

  render() {

      return (
        <div>
          <Header activePage="about"/>
            <SubPageBanner locale={this.props.locale}
              img="/assets/home/Moabi-Aerial.jpg"
               title={this.__('About')}
               subTitle={MAPHUBS_CONFIG.productName + ' ' +this.__(`is a home for the world's open map data and an easy tool for making and sharing maps. Our mission is to help you tell your story using maps and to foster communities with impact.`)} />
          <main className="container">

            <div className="row" style={{marginTop: '30px'}}>

                <h4 lang="en">Our challenge</h4>
                <div className="row no-margin">
                <div className="col s12 m12 l5">
                  <p lang="en" style={{fontSize: '18px', marginTop: 0}}>
                    Maps are critical to fighting climate change, eradicating poverty, and protecting imperiled biologically rich forests. They provide context to complex issues, illuminate risks, and evidence of impacts. While satellites give us a window in the state of the world’s rainforests, the fragmentation of tiger landscapes and the vulnerability of river deltas to climate change, they don’t the whole story. They don’t tell us who is causing the deforestation, where a river is going to be dammed, or who owns a farm.
                  </p>

                </div>
                <div className="col s12 m12 l7">
                  <div  className="video-container">
                    <iframe src="https://maphubs.com/map/embed/164/static" frameBorder="0"></iframe>
                  </div>
                </div>
              </div>
              <p lang="en" style={{fontSize: '18px', marginTop: 0}}>
                This vital data is locked up in a variety of data formats, at different scales, and increasingly fragmented, making it inaccessible to those who want to use it. A major reason for this is data producers (governments, companies, etc.) often don’t have a relationship those who use their data. This makes sharing their data a black box; they don’t know who downloads or uses it. This makes map data difficult to find and use in meaningful ways. Even if data is available, making maps is needlessly complicated and expensive, which disenfranchises many who simply want to make maps.
              </p>
              <div className="divider" />
                <h4 lang="en">Our approach</h4>
                <div className="row no-margin">
                    <div className="col s12 m12 l6">
                      <img className="responsive-img" src="/assets/about/community.jpg" style={{width: '100%'}}></img>
                    </div>
                    <div className="col s12 m12 l6">
                      <p lang="en" style={{fontSize: '18px', marginTop: 0}}>
                        {MAPHUBS_CONFIG.productName} helps environmental and development practitioners and journalists access global map data and make maps. It helps establish connections between data producers and communities that use the data and tracks how their data is used. {MAPHUBS_CONFIG.productName} already hosts hundreds of map layers from oil palm plantations in Indonesia, planned hydroelectric dams in Myanmar, to indigenous territories in Colombia. It also has simple, easy to use tools to turn data into fast, beautiful interactive maps for publishing in reports, social media, and websites.
                      </p>
                    </div>
                </div>
                <div className="divider" />
                <h4 lang="en">Our impact</h4>
                  <div className="col s12 m12 l5">
                    <p lang="en" style={{fontSize: '18px', marginTop: 0}}>
                      The technology is already improving transparency and strengthening decision making in some of the most remote, biologically rich, and impoverished parts of the world. Tried and tested in the Democratic Republic of the Congo, {MAPHUBS_CONFIG.productName} is supporting health researchers mapping villages in DRC for sleeping sickness vaccination campaigns, monitoring the encroachment of industrial agricultural in to orangutan habitat in Indonesia, and spotting illegal logging in the Peruvian Amazon.
                    </p>
                  </div>
                  <div className="row no-margin">
                    <div className="col s12 m12 l7">
                      <div  className="video-container">
                        <iframe src="https://maphubs.com/map/embed/158/static" frameBorder="0"></iframe>
                      </div>
                    </div>
                </div>
                <div className="divider" />
                <h4 lang="en">Our vision</h4>
                  <div className="row no-margin">
                      <div className="col s12 m12 l6">
                        <img className="responsive-img" src="/assets/home/Moabi-Leaves.jpg" style={{width: '100%'}}></img>
                      </div>
                      <div className="col s12 m12 l6">
                        <p lang="en" style={{fontSize: '18px', marginTop: 0}}>
                          {MAPHUBS_CONFIG.productName}’s goal is to build a global community to make map data available to all and provide cost effective map making technology to anyone, anywhere who wants to make a map. Immediate goals are expanding the database, integrating mobile applications for field mapping, and building premium features for custom map making.
                        </p>
                      </div>
                  </div>
                  <div className="divider" />
                <h4 lang="en">Who we are</h4>
                <div className="row">
                  <div className="col s12 m12 l6">
                    <div className="circle"
                      style={{width: '250px', height: '250px',   margin: 'auto',
                        backgroundSize: 'cover',
                        backgroundPosition: '30% 50%',
                        backgroundImage: 'url(/assets/about/leo.jpg)'
                      }} />
                    <h5 lang="en">Leo Bottrill – Founder and CEO</h5>
                    <p lang="en" style={{fontSize: '18px', marginTop: 0}}>
                      Leo is the founder and CEO of CrowdCover LLC, a Washington DC-based company, dedicated to making maps more accessible to everyone. Leo has 15 years of experience in the environment and development sector including over 4 years working in field conservation in Vietnam and Indonesia.
                    </p>
                    <p lang="en" style={{fontSize: '18px'}}>
                      Prior to founding CrowdCover, Leo started the awarding winning Moabi DRC initiative (rdc.moabi.org) in the Democratic Republic of the Congo. Moabi DRC is the most comprehensive public database on land use in DRC. It is implemented by Observatoire Satellital des Forêts d'Afrique Centrale, a regional forest monitoring organization, and supported by a consortium of nonprofits, government agencies, research organizations, and companies.
                    </p>
                  </div>
                  <div className="col s12 m12 l6">
                    <div className="circle"
                      style={{width: '250px', height: '250px',   margin: 'auto',
                        backgroundSize: 'cover',
                        backgroundPosition: '30% 50%',
                        backgroundImage: 'url(/assets/about/kris.jpg)'
                      }} />
                    <h5 lang="en">Kristofor Carle – Chief Technology Officer</h5>
                    <p lang="en" style={{fontSize: '18px', marginTop: 0}}>
                      Kris is a geospatial software engineer focusing on spatial databases, web mapping applications, data analytics, and mobile applications. Before joining CrowdCover, Kris led a large geospatial data warehouse project and a mobile mapping application as a contractor for U.S. Army. He is very passionate about open-source technologies and has made over 1 million contributions to OpenStreetMap!
                    </p>
                  </div>
                </div>
            </div>

            <div className="divider"></div>
            <div className="row">
              <p lang={this.props.locale}>{MAPHUBS_CONFIG.productName + ' ' + this.__('Version:')} {this.props.version}</p>
              <p lang={this.props.locale}>{MAPHUBS_CONFIG.productName + ' ' + this.__('is open source and avaliable on GitHub at')} <a target="_blank" href="https://github.com/maphubs/maphubs">https://github.com/maphubs/maphubs</a></p>
            </div>
          </main>
          <Footer />
        </div>
      );


  }
});

module.exports = About;
