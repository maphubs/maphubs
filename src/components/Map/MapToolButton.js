var React = require('react');
var $ = require('jquery');

var MapToolButton = React.createClass({

  propTypes: {
    icon: React.PropTypes.string,
    top: React.PropTypes.string,
    right: React.PropTypes.string,
    tooltipText: React.PropTypes.string,
    onClick: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool

  },

  getDefaultProps(){
    return {
      icon: 'edit',
      top: '10px',
      right: '10px',
      tooltipText: '',
      show: true
    };
  },

  componentDidMount(){
    $(this.refs.mapToolButton).tooltip();
  },

  onClick(e){
    $(this.refs.mapToolButton).tooltip('remove');
    $(this.refs.mapToolButton).tooltip();
    this.props.onClick(e);
  },

  render(){
    if(this.props.show){
    return (
      <a ref="mapToolButton"
          onClick={this.onClick}
          style={{position: 'absolute',
            top: this.props.top,
            right: this.props.right,
            height:'30px',
            zIndex: '100',
            lineHeight: '30px',
            textAlign: 'center',
            width: '30px'}}
            data-position="bottom" data-delay="50" data-tooltip={this.props.tooltipText}
          >
          <i  className="material-icons z-depth-1"
            style={{height:'30px',
                    lineHeight: '30px',
                    width: '30px',
                    color: MAPHUBS_CONFIG.primaryColor,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    borderColor: '#ddd',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    textAlign: 'center',
                    fontSize:'25px'}}          
            >{this.props.icon}</i>
        </a>
    );
    }else{
      return null;
    }
  }

});

module.exports = MapToolButton;