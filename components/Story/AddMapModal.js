var React = require('react');
import {Modal, ModalContent} from '../Modal/Modal.js';

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var CardCarousel = require('../CardCarousel/CardCarousel');
var cardUtil = require('../../services/card-util');
var SearchBox = require('../SearchBox');
var NotificationActions = require('../../actions/NotificationActions');
var config = require('../../clientconfig');
var urlUtil = require('../../services/url-util');
var request = require('superagent');
var checkClientError = require('../../services/client-error-response').checkClientError;
var MessageActions = require('../../actions/MessageActions');
var debug = require('../../services/debug')('AddMapToStory');

var AddMapModal = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    onAdd:  React.PropTypes.func,
    onClose:  React.PropTypes.func,
    myMaps: React.PropTypes.array,
    popularMaps: React.PropTypes.array
  },

  getDefaultProps(){
    return {
      myMaps:[],
      popularMaps: []
    };
  },

  getInitialState() {
    return {
      show: false
    };
  },

  show(){
    this.setState({show: true});
  },

  onAdd(map){
    this.setState({show: false});
    this.props.onAdd(map);
  },

  close(){
    this.setState({show: false});
  },

  handleSearch(input) {
    var _this = this;
    debug('searching for: ' + input);
    request.get(urlUtil.getBaseUrl(config.host, config.port) + '/api/maps/search?q=' + input)
    .type('json').accept('json')
    .end(function(err, res){
      checkClientError(res, err, function(err){
        if(err){
          MessageActions.showMessage({title: 'Error', message: err});
        }else{
          if(res.body.maps && res.body.maps.length > 0){
            _this.setState({searchActive: true, searchResults: res.body.maps});
            NotificationActions.showNotification({message: res.body.maps.length + ' ' + _this.__('Results'), position: 'bottomleft'});
          }else{
            //show error message
            NotificationActions.showNotification({message: _this.__('No Results Found'), dismissAfter: 5000, position: 'bottomleft'});
          }
        }
      },
      function(cb){
        cb();
      }
      );
    });
  },

  resetSearch(){
    this.setState({searchActive: false, searchResults: []});
  },

  modalReady(){
    this.setState({modalReady: true});
  },

  render(){
    var _this = this;

    var myMaps = '';
    if(this.props.myMaps && this.props.myMaps.length > 0){
      var myCards = this.props.myMaps.map(function(map, i){
        return cardUtil.getMapCard(map, i, [], _this.onAdd);
      });
      myMaps = (
        <div className="row" style={{width: '100%'}}>
          <div className="col s12 no-padding" style={{width: '100%'}}>
            <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{this.__('My Maps')}</h5>
            <div className="divider"></div>
            <CardCarousel cards={myCards} infinite={false}/>
          </div>
        </div>
      );
    }

    var popularCards = this.props.popularMaps.map(function(map, i){
      return cardUtil.getMapCard(map, i, [], _this.onAdd);
    });

    var searchResults = '';
    var searchCards = [];
    if(this.state.searchActive){
      if(this.state.searchResults.length > 0){


        searchCards = this.state.searchResults.map(function(map, i){
          return cardUtil.getMapCard(map, i, [], _this.onAdd);
        });
        searchResults = (
          <div className="row">
            <div className="col s12 no-padding">
            <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{this.__('Search Results')}</h5>
            <div className="divider"></div>
            <CardCarousel infinite={false} cards={searchCards}/>
          </div>
          </div>
        );
      }
      else {
        searchResults = (
          <div className="row">
            <div className="col s12">
            <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{this.__('Search Results')}</h5>
            <div className="divider"></div>
            <p><b>{this.__('No Results Found')}</b></p>
          </div>
          </div>
        );
      }
    }

    return (
      <Modal show={this.state.show} ready={this.modalReady} className="create-map-modal" style={{overflow: 'hidden'}} dismissible={false} fixedFooter={false}>
        <ModalContent style={{padding: 0, margin: 0, height: '100%', overflow: 'hidden', width: '100%'}}>
          <a className="omh-color" style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}} onClick={this.close}>
            <i className="material-icons selected-feature-close" style={{fontSize: '35px'}}>close</i>
          </a>
          <div className='row' style={{marginTop: '10px', marginBottom: '10px', marginRight: '35px', marginLeft: '0px'}}>
            <div className='col s12'>
              <SearchBox label={this.__('Search Maps')} suggestionUrl="/api/maps/search/suggestions" onSearch={this.handleSearch} onReset={this.resetSearch}/>
            </div>
          </div>
          <div className='row'style={{height: 'calc(100% - 55px)', width: '100%', overflow: 'auto'}}>
            <div className='col s12 no-padding' style={{height: '100%', width: '100%'}}>
              {searchResults}
              {myMaps}
              <div className="row">
                <div className="col s12 no-padding">
                  <h5 style={{fontSize: '1.3rem', margin: '5px'}}>{this.__('Popular Maps')}</h5>
                  <div className="divider"></div>
                  <CardCarousel cards={popularCards} infinite={false}/>
                </div>
              </div>
            </div>
          </div>

      </ModalContent>
      </Modal>
      );
  }

});

module.exports = AddMapModal;
