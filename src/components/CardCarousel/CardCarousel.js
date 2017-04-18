import React from 'react';
import PropTypes from 'prop-types';
var Slider = require('react-slick');
var Card = require('./Card');

var CardCarousel = React.createClass({

  propTypes:  {
    cards: PropTypes.array.isRequired,
    autoplay: PropTypes.bool,
    arrows: PropTypes.bool,
    dots: PropTypes.bool,
    infinite: PropTypes.bool,
    speed: PropTypes.number,
    slidesToShow: PropTypes.number,
    slidesToScroll: PropTypes.number,
    responsive: PropTypes.array
  },

  getDefaultProps() {
    return {
      cards: [],
      responsive: [
        {breakpoint: 450, settings: {slidesToShow: 1,  slidesToScroll: 1}},
        {breakpoint: 768, settings: {slidesToShow: 2,  slidesToScroll: 2}},
        {breakpoint: 950, settings: {slidesToShow: 3,  slidesToScroll: 3}},
        {breakpoint: 1150, settings: {slidesToShow: 4,  slidesToScroll: 4}},
        {breakpoint: 1400, settings: {slidesToShow: 5,  slidesToScroll: 5}},
        {breakpoint: 1700, settings: {slidesToShow: 6,  slidesToScroll: 6}},
         {breakpoint: 2500, settings: {slidesToShow: 8,  slidesToScroll: 8}},
         {breakpoint: 4000, settings: {slidesToShow: 10,  slidesToScroll: 10}}
     ]
    };
  },

  render() {
    var settings = {
       autoplay: this.props.autoplay !== undefined ? this.props.autoplay : false,
       arrows: this.props.arrows !== undefined ? this.props.arrows : true,
       dots: this.props.dots !== undefined ? this.props.dots : true,
       infinite: this.props.infinite !== undefined ? this.props.infinite : true,
       speed: this.props.speed ? this.props.speed : 500,
       slidesToShow: this.props.slidesToShow ? this.props.slidesToShow : 3,
       slidesToScroll: this.props.slidesToScroll ? this.props.slidesToScroll : 3,
       responsive: this.props.responsive,
       lazyLoad: true
     };

     var slider = '';
     if(this.props.cards && this.props.cards.length > 0){
       slider = (
         <Slider ref="slider" {...settings}>
           {this.props.cards.map(function(card){
             return (
               <div key={card.id}>
                 <Card {...card} />
              </div>
            );
           })}
         </Slider>
       );
     }

     return (
       <div className="card-carousel">
        {slider}
      </div>
     );
  }
});

module.exports = CardCarousel;
