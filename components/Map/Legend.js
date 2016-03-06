var React = require('react');
var LegendItem = require('./LegendItem');

var Legend = React.createClass({
  propTypes:  {
    layers: React.PropTypes.array,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    title: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      layers: [],
      style: {}
    };
  },

  render(){
    var title = '';
    if(this.props.title){
      title = (
        <li className="collection-item no-margin" style={{padding: '0.2rem', fontWeight: '500'}}>
          <h6 className="center-align">{this.props.title}</h6>
        </li>
      );
    }

    return (
      <div className={this.props.className} style={this.props.style}>
        <div style={{textAlign: 'left'}}>

            <ul className="collection with-header no-margin z-depth-2">
              {title}
            {
              this.props.layers.map(function (layer) {
                return (<LegendItem key={layer.layer_id} layer={layer} style={{padding: '2px', width: '100%', margin: 'auto'}}/>);
                })
            }
            <li className="collection-item no-margin no-padding" style={{lineHeight: '0.75em'}}>
              <span style={{fontSize: '8px', paddingLeft: '2px'}} className="grey-text">Base Map - </span>
              <a style={{fontSize: '8px'}} className="grey-text" href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox </a>
              <a style={{fontSize: '8px'}} className="grey-text" href="http://www.openstreetmap.org/about/" target="_blank"> © OpenStreetMap</a>
            </li>
          </ul>
        </div>
      </div>
    );
  }

});

module.exports = Legend;
