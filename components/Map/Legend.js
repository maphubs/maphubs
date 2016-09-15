var React = require('react');
var $ = require('jquery');
var LegendItem = require('./LegendItem');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var Legend = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    layers: React.PropTypes.array,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    title: React.PropTypes.string,
    collapsible: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      layers: [],
      style: {},
      collapsible: true
    };
  },

  getInitialState(){
    return {
      collapsed: false
    };
  },

  toggleCollapsed(){
    this.setState({
      collapsed: this.state.collapsed ? false : true
    });
  },

  componentDidMount(){
    $(this.refs.legend).collapsible();
  },

  render(){
    var titleText = '';
    if(this.props.title){
      titleText = this.props.title;
    }else{
      titleText = this.__('Legend');
    }
    var title = '';
    if(this.props.collapsible){

      var iconName = 'keyboard_arrow_up';
      if(this.state.collapsed){
        iconName = 'keyboard_arrow_down';
      }

      title = (
        <div className="row no-margin" style={{height: '44px'}}>
          <div className="col s10 no-padding valign-wrapper" style={{height: '44px'}}>
            <h6 className="black-text valign" style={{padding: '0.2rem', marginLeft: '2px', fontWeight: '500'}}>{titleText}</h6>
          </div>
          <div className="col s2 no-padding valign">
            <i ref="titleIcon" className="material-icons icon-fade-in" style={{float: 'right'}}>{iconName}</i>
          </div>
        </div>
      );
    }else{
      title = (
        <div className="row no-margin valign-wrapper" style={{height: '44px'}}>
          <h6 className="black-text valign" style={{padding: '0.2rem',  marginLeft: '2px', fontWeight: '500'}}>{titleText}</h6>
        </div>
      );
    }

    var allowScroll = true;
    if(this.state.collapsed || this.props.layers.length==1){
      allowScroll = false;
    }

    return (
      <div className={this.props.className} style={this.props.style}>
        <ul ref="legend" className="collapsible" data-collapsible="accordion" style={{textAlign: 'left', display: 'flex', flexDirection: 'column', marginTop: 0}}>
        <li style={{display: 'flex', flexDirection: 'column', backgroundColor: '#FFF'}}>
          <div className="collapsible-header active no-padding" onClick={this.toggleCollapsed}>
            {title}
          </div>
          <div className="collapsible-body" style={{display: 'flex', flexDirection: 'column'}}>
            <ul className="collection no-margin z-depth-2"  style={{overflowY: allowScroll ? 'auto': 'hidden'}}>
              {
                this.props.layers.map(function (layer) {
                  return (<LegendItem key={layer.layer_id} layer={layer} style={{padding: '2px', width: '100%', margin: 'auto'}}/>);
                })
              }
              <li className="collection-item no-margin no-padding" style={{lineHeight: '0.75em'}}>
                <span style={{fontSize: '8px', paddingLeft: '2px'}} className="grey-text">Base Map -
                <a style={{fontSize: '8px', lineHeight: '0.75rem', height: '10px', padding: 0, display: 'inherit'}} className="grey-text" href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox </a>
                <a style={{fontSize: '8px', lineHeight: '0.75rem', height: '10px', padding: 0, display: 'inherit'}} className="grey-text" href="http://www.openstreetmap.org/about/" target="_blank"> © OpenStreetMap</a>
                </span>
              </li>
            </ul>
          </div>
          </li>
        </ul>
      </div>
    );
  }

});

module.exports = Legend;
