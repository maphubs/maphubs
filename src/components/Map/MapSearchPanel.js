//@flow
import React from 'react';
var $ = require('jquery');
import MapHubsComponent from '../MapHubsComponent';
import SearchBar from '../SearchBar/SearchBar';

type Props = {
  show: boolean,
  onSearch:  Function,
  height: string,
  results: Array<Object>
}

export default class MapSearchPanel extends MapHubsComponent<void, Props, void> {

  props: Props

  static defaultProps = {
    show: false
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

  onSearch = (val: string) => {
    this.closePanel();
    this.props.onSearch(val);
  }

  

  render(){
    let results = '';
    if(!this.state.results || this.state.results.length === 0){
      results = (
        <p>{this.__('Use the box above to search')}</p>
      );
    }else{
      results = (
        <div>
          
        </div>
      );
    }

    return (
      <div> 
         <a ref="mapSearchButton"
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
          <SearchBar />
            <ul ref="tabs" className="tabs tabs-fixed-width">
              <li className="tab"><a className="active" href="#map-search-data">{this.__('Data')}</a></li>
              <li className="tab"><a href="#map-search-location">{this.__('Location')}</a></li>
          </ul>
          <div id="map-search-data">
            {results}
          </div>
          <div id="map-search-location">

          </div>
        </div>
      </div>
    );
  }
}