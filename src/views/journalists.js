//@flow
import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import SubPageBanner from '../components/Home/SubPageBanner';
import IconRow from '../components/Home/IconRow';
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';

export default class Journalists extends MapHubsComponent {

  props: {
    locale: string,
    footerConfig: Object,
    headerConfig: Object,
    _csrf: string
  }

  constructor(props: Object) {
    super(props);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
  }

  render() {
      return (
        <div>
          <Header {...this.props.headerConfig}/>
            <SubPageBanner locale={this.props.locale}
              img="/assets/home/MapHubs-Map.jpg"
               title={MAPHUBS_CONFIG.productName + ' ' + this.__('for Journalists')} subTitle={this.__(`
                   Maps are incredibly powerful tools for journalism.
                   One map can illuminate a story, bringing context and clarity to complex issues such as illegal logging and climate change.
                  `)} />
            <main className="container">
            <div className="row" style={{marginTop: '30px'}}>
              <h4 lang="en">But why aren’t more journalists using maps?</h4>
              <div className="row" style={{marginTop: '25px'}}>
                <div className="col s12 m12 l5">
                  <p lang="en" style={{fontSize: '20px', marginTop: 0}}>
                    Maps are difficult, time consuming, and expensive to make. With today’s shrinking media budgets, most journalists don’t have the technical or financial resources to produce accurate interactive maps.
                    Even large media organizations, with in house cartography departments and expensive mapping and graphics packages, find <span style={{fontWeight: 'bold'}}>map making a costly and lengthy process, particularly when the data is not at hand.</span>
                  </p>
                </div>
                <div className="col s12 m12 l7">
                  <div className="video-container">
                    <iframe src="https://mapforenvironment.org/map/embed/158/static" frameBorder="0"></iframe>
                  </div>
                </div>
              </div>
              <div className="divider" />
              <h4 lang="en">In house map making for journalists</h4>
              <div className="row" style={{marginTop: '25px'}}>
                  <div className="col s12 m12 l7">
                    <div  className="video-container">
                      <iframe src="https://mapforenvironment.org/map/embed/112/static" frameBorder="0"></iframe>
                    </div>
                  </div>
                  <div className="col s12 m12 l5">
                    <p lang="en" style={{fontSize: '20px', marginTop: 0}}>
                    {MAPHUBS_CONFIG.productName} is a journalist’s own in-house map making system.
                    The platform brings together a rich and growing database of environmentally relevant maps along with easy to use tools to turn map layers into fast beautiful custom maps.
                    And the best thing is no GIS, web development, or cartographic training is required. <span style={{fontWeight: 'bold'}}>Anyone can make a professional looking map in minutes.</span>
                    </p>
                  </div>
              </div>
              <div className="divider" />
              <h4 lang="en">Ready to use data</h4>
              <div className="row" style={{marginTop: '25px'}}>
                <div className="col s12 m12 l5">
                  <p lang="en" style={{fontSize: '20px', marginTop: 0}}>
                    {MAPHUBS_CONFIG.productName} makes finding data - often the most time consuming part of map making - easy and fast. {MAPHUBS_CONFIG.productName} has a rapidly growing database of open map layers from some of the most respected government, research, and nonprofit organizations. <span style={{fontWeight: 'bold'}}>Journalists can search for map layers they need and use them to make their own map.</span>
                  </p>
                </div>
                <div className="col s12 m12 l7">
                  <div  className="video-container">
                    <iframe src="https://mapforenvironment.org/map/embed/163/static" frameBorder="0"></iframe>
                  </div>
                </div>
              </div>
              <div className="divider" />
              <h4 lang="en">How to make a map</h4>
                <IconRow icon="cloud_upload">
                  <h5 lang="en">Upload or make your map layer</h5>
                  <p lang="en" style={{fontSize: '20px'}}>
                    If you have data, you can upload it into Maphubs and combine it with map layers in our database. You can also make a make your own map layer directly in Maphubs.
                  </p>
                </IconRow>
                <IconRow icon="color_lens">
                  <h5 lang="en">Style your map</h5>
                  <p lang="en" style={{fontSize: '20px'}}>
                    Once you have your map layers, you can choose a color for your map layers, whether titles, the order they appear, and which basemap you want to use.
                  </p>
                </IconRow>
                <IconRow icon="print">
                  <h5 lang="en">Embed, print, and share your map</h5>
                  <p lang="en" style={{fontSize: '20px'}}>
                    When you map is ready, simply save it and then you can either embed your map in your website, share it on social media, or download a PNG version and publish it in print.
                  </p>
                </IconRow>

                <div className="row center center-align">
                  <a className="btn waves-effect z-depth-3" style={{borderRadius: '25px'}} lang="en" href="/map/new">Make a Map</a>
                </div>
                <div className="container center center-align">
                  <p lang="en" style={{fontSize: '20px'}}>For more detailed instructions on how to make a map, read our tutorials at: <a href="http://help.maphubs.com/category/5-make-a-map">help.maphubs.com</a></p>
                </div>
            </div>
            </main>
          <Footer {...this.props.footerConfig}/>
        </div>
      );
  }
}