import React from 'react';
import PropTypes from 'prop-types';

var Attributes = React.createClass({

  propTypes: {
		attributes: PropTypes.object.isRequired,
    selected: PropTypes.bool.isRequired,
    multipleSelected: PropTypes.bool.isRequired,
    presets:  PropTypes.array,
    children: PropTypes.any
  },


  render() {
    var _this = this;


    var spacer = (<div style={{height: '50px'}}></div>);
    if (this.props.multipleSelected){
      spacer = (<div style={{height: '118px'}}></div>);
    }

    var display = '';
    var photo = '';
    var photoUrl = null;
    if(_this.props.attributes.photo_url){
      photoUrl = _this.props.attributes.photo_url;
    }else if(_this.props.attributes['Photo URL']){
      photoUrl = _this.props.attributes['Photo URL'];
    }

    if(photoUrl){
      photo = (
        <img src={photoUrl} style={{width: '180px', height: 'auto'}} alt="feature photo"/>
      );
    }

    if(_this.props.attributes && Object.keys(_this.props.attributes).length > 0){
      if(this.props.presets){
        var presets = this.props.presets;
        //only display presets
        display = (
            <ul className="collection" style={{marginTop: 0}}>
              {photo}
              {
                presets.map(function(preset){
                  if(typeof preset.showOnMap !== 'undefined' && preset.showOnMap === false) return '';
                  var val = _this.props.attributes[preset.tag];
                  if(!val || (typeof val === 'string' && val === 'null')) return '';
                  if(typeof val === 'string' && val.startsWith('http')){
                    val = (<a target="_blank" href={val}>{val}</a>);
                  }
                  return (
                     <li key={preset.tag} style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: 0, paddingBottom: 0}} className="collection-item attribute-collection-item">
                      <p style={{color: 'rgb(158, 158, 158)', fontSize: '11px'}}>{preset.label}</p>
                       <p className="word-wrap">
                         {val}
                       </p>
                     </li>
                   );

                })
              }
            </ul>

        );
      }else {

        display = (
            <ul className="collection" style={{marginTop: 0}}>
              {photo}
              {
                Object.keys(_this.props.attributes).map(function (key) {
                    if(key !== 'mhid' || key !== 'layer_id'
                    || key !== 'maphubs_host'){
                     var val = _this.props.attributes[key];
                     if(typeof val === 'string' && val.startsWith('http')){
                       val = (<a target="_blank" href={val}>{val}</a>);
                     }
                     return (
                      <li key={key} style={{ padding: 5}} className="collection-item attribute-collection-item">
                      <p style={{color: 'rgb(158, 158, 158)', fontSize: '11px'}}>{key}</p>
                       <p className="word-wrap">
                         {val}
                       </p>
                     </li>
                      );
                    }
                 })
              }

            </ul>

        );

      }


    }
    var marginTop = '0px';
    if(this.props.selected){
       marginTop = '25px';
    }

    return (
      <div style={{marginTop, width: '100%', overflowY: 'auto', height: 'calc(100% - 85px)', borderTop: '1px solid #DDD'}}>
      {display}
      {spacer}
      {this.props.children}
      </div>
    );
  }
});

module.exports = Attributes;
