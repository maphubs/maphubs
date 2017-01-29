var React = require('react');

var $ = require('jquery');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var BaseMapStore = require('../../stores/map/BaseMapStore');
var Locales = require('../../services/locales');
var LegendItem = require('./LegendItem');

var MiniLegend = React.createClass({

  mixins:[StateMixin.connect(LocaleStore), StateMixin.connect(BaseMapStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes:  {
    title: React.PropTypes.string,
    layers: React.PropTypes.array,
    hideInactive: React.PropTypes.bool,
    collapsible: React.PropTypes.bool,
    style: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      layers: [],
      hideInactive: true,
      collapsible: true,
      style: {}
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

      var iconName = 'keyboard_arrow_down';
      if(this.state.collapsed){
        iconName = 'keyboard_arrow_up';
      }

      title = (
        <div className="row no-margin" style={{height: '30px'}}>
          <div className="col s10 no-padding valign-wrapper" style={{height: '30px'}}>
            <h6 className="black-text valign" style={{padding: '0.2rem', marginLeft: '2px', marginTop: '0px', marginBottom: '0px', fontWeight: '500'}}>{titleText}</h6>
          </div>
          <div className="col s2 no-padding valign">
            <i ref="titleIcon" className="material-icons icon-fade-in" style={{float: 'right', marginRight: 0, height: '100%', lineHeight: '30px'}}>{iconName}</i>
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
      <div style={this.props.style}>

       <ul ref="legend" className="collapsible" data-collapsible="accordion" style={{textAlign: 'left', display: 'flex', flexDirection: 'column', marginTop: 0}}>
        <li style={{display: 'flex', flexDirection: 'column', backgroundColor: '#FFF'}}>
          <div className="collapsible-header active no-padding" style={{height: '30px', minHeight: '30px'}} onClick={this.toggleCollapsed}>
            {title}
          </div>
          <div className="collapsible-body" style={{display: 'flex', flexDirection: 'column', padding: '5px'}}>
            <ul className="collection no-margin"  style={{overflowY: allowScroll ? 'auto': 'hidden'}}>
              {
                this.props.layers.map(function (layer) {
                  var legendHtml = layer.map_legend_html ? layer.map_legend_html : layer.legend_html;
                  layer.legend_html = legendHtml;
                  return (<LegendItem key={layer.layer_id} layer={layer} style={{padding: '2px', width: '100%', margin: 'auto'}} mini/>);
                })
              }
 
            <li className="collection-item no-margin no-padding" style={{lineHeight: '0.75em'}}>
              <span style={{fontSize: '8px', paddingLeft: '2px', float: 'left', backgroundColor: '#FFF'}} 
              className="grey-text align-left">Base Map - <span className="no-margin no-padding" dangerouslySetInnerHTML={{__html: this.state.attribution}}></span></span>
            </li>           
            </ul>
          </div>
          </li>
        </ul>
      </div>
    );
  }

});

module.exports = MiniLegend;
