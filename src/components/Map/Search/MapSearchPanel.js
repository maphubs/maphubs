//@flow
import React from 'react';
var $ = require('jquery');
import MapHubsComponent from '../../MapHubsComponent';
import SearchBar from '../../SearchBar/SearchBar';
import request from 'superagent-bluebird-promise';
import MessageActions from '../../../actions/MessageActions';
var debug = require('../../../services/debug')('MapSearchPanel');

type Props = {
  show: boolean,
  onSearch:  Function,
  onSearchResultClick: Function,
  onSearchReset: Function,
  height: string
}

type State = {
  results?: ?Object,
  locationSearchResults?: ?Object,
  tab: string,
  query?: string
}

export default class MapSearchPanel extends MapHubsComponent<Props, State> {

  props: Props

  static defaultProps = {
    show: false
  }

  state: State

  constructor(props: Props){
    super(props);
    this.state = {
      tab: 'data'
    };
  }  

  componentDidMount(){  
    $(this.refs.mapSearchButton).tooltip();
    $(this.refs.mapSearchButton).sideNav({
        menuWidth: 240, // Default is 240
        edge: 'right', // Choose the horizontal origin
        closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
        draggable: false // Choose whether you can drag to open on touch screens
      });
    $(this.refs.tabs).tabs();
  }

  onPanelOpen = () => {
    $(this.refs.mapSearchButton).tooltip('remove');
  }

  closePanel = () => {
    $(this.refs.mapSearchButton).sideNav('hide');
  }

  onSearch = (query: string) => {
    if(this.state.tab === 'data'){
      let results = this.props.onSearch(query);
      this.setState({results, query});
    }else if(this.state.tab === 'location'){
      this.runLocationSearch(query);
    }
  }

  onSubmit = () => {
    //enter is pressed in search box
    //do nothing, since we update automatically
  }

  onReset = () => {
    this.setState({results: null, locationSearchResults: null, query: undefined});
    this.props.onSearchReset();
  }

  onClickResult = (result: Object) => {
    this.props.onSearchResultClick(result);
  }

  selectTab = (tab: string) => {
    if(tab === 'location' && 
      this.state.tab !== 'location' &&
      this.state.query){    
      if(!this.state.locationSearchResults){
         this.runLocationSearch(this.state.query);
      }
      this.setState({tab});
    }else if(tab === 'data' && 
      this.state.tab !== 'data' &&
      this.state.query){
        this.setState({tab});
        if(!this.state.results){
           let results = this.props.onSearch(this.state.query);
          this.setState({results});
        } 
    }
    
  }
  //Uses Mapzen autocomplete API
  runLocationSearch(query: string){
    var _this = this;
    //get mapzen API key
    
    //run autocomplete search
    let url = `https://search.mapzen.com/v1/autocomplete?text=${query}&api_key=${MAPHUBS_CONFIG.MAPZEN_API_KEY}`;
     request.get(url)
    .then((res) => {
      let locationSearchResults = res.body;
      return _this.setState({locationSearchResults, query});
    })
    .catch(err=>{
      debug.log(err);
      MessageActions.showMessage({title: 'Error', message: err.toString()});
    });
  }

  render(){
    var _this = this;
    let results = '';

    if(this.state.results && 
      this.state.results.list && 
      this.state.results.list.length > 0){
         results = (
        <div className="collection">
          {
            this.state.results.list.map(result => {
              return (
                <a key={result.id} href="#!" className="collection-item" 
                onClick={function(){_this.onClickResult(result.geoJSON);}}>
                  {result.name}
                </a>
              );
            })
          }
        </div>   
      );
      
    }else{
     results = (
        <p>{this.__('Use the box above to search')}</p>
      );
    }

    let searchLabel = '';
    if(this.state.tab === 'data'){
      searchLabel = this.__('Search Data');
    }else if(this.state.tab === 'location'){
      searchLabel = this.__('Find Place or Address');
    }

    let locationResults = '';
    if(this.state.locationSearchResults && 
      this.state.locationSearchResults.features &&
      this.state.locationSearchResults.features.length > 0){
      locationResults = (
         <div className="collection">
          {
            this.state.locationSearchResults.features.map(result => {
              return (
                <a key={result.properties.id} href="#!" className="collection-item" 
                onClick={function(){_this.onClickResult(result);}}>
                  {result.properties.name}
                </a>
              );
            })
          }
        </div>   
      );
    }

    return (
      <div> 
         <a ref="mapSearchButton"
         className="map-search-button"
          href="#" 
          data-activates="map-search-panel"
          onMouseDown={this.onPanelOpen}
          style={{
            display: this.props.show ? 'inherit' : 'none',
            position: 'absolute',         
            top: '10px',            
            right: '160px',
            height:'30px',
            zIndex: '100',
            borderRadius: '4px',
            lineHeight: '30px',
            textAlign: 'center',
            boxShadow: '0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)',
            width: '30px'
          }}
            data-position="bottom" data-delay="50" 
            data-tooltip={this.__('Search')}
          >
          <i  className="material-icons"
            style={{height:'30px',
                    lineHeight: '30px',
                    width: '30px',
                    color: '#000',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    borderColor: '#ddd',
                    borderStyle: 'none',
                    borderWidth: '1px',
                    textAlign: 'center',
                    fontSize:'18px'}}          
            >search</i>
        </a>
        <div className="side-nav" id="map-search-panel"
              style={{
                backgroundColor: '#FFF',              
                height: '100%', 
                overflow: 'hidden',
                padding: '5px',
                position: 'absolute',
                border: '1px solid #d3d3d3'}}>
            <SearchBar id={'map-search-bar'}
              placeholder={searchLabel}
              onChange={this.onSearch}
              onSubmit={this.onSubmit}
              onReset={this.onReset} />
            <ul ref="tabs" className="tabs tabs-fixed-width">
              <li className="tab" onClick={function(){_this.selectTab('data');}}><a className="active" href="#map-search-data">{this.__('Data')}</a></li>
              <li className="tab" onClick={function(){_this.selectTab('location');}}><a href="#map-search-location">{this.__('Location')}</a></li>
          </ul>
          <div id="map-search-data">
            {results}
          </div>
          <div id="map-search-location">
            {locationResults}
          </div>
        </div>
      </div>
    );
  }
}