import React from 'react';
import PropTypes from 'prop-types';
var CardCarousel = require('./CardCarousel');

var CardRow = React.createClass({

  propTypes: {
    cards: PropTypes.array.isRequired,
    title: PropTypes.string
  },

  getDefaultProps(){
    return {
      title: null
    };
  },

  render(){
    var title = '';
    if(this.props.title){
      title = (
        <h5>{this.props.title}</h5>
      );
    }
   return (
     <div className="row">
          <div className="col s12">
            {title}
            <div className="divider"></div>
            <CardCarousel cards={this.props.cards} infinite={false}/>
          </div>
        </div>
   );
  }

});

module.exports = CardRow;
