var React = require('react');
var Slider = require('../../node_modules/react-slick/src');
var MapMakerCard = require('./MapMakerCard');

var CardCarousel = React.createClass({

  propTypes:  {
    cards: React.PropTypes.array.isRequired,
    autoplay: React.PropTypes.bool,
    arrows: React.PropTypes.bool,
    dots: React.PropTypes.bool,
    infinite: React.PropTypes.bool,
    speed: React.PropTypes.number,
    slidesToShow: React.PropTypes.number,
    slidesToScroll: React.PropTypes.number
  },

  getDefaultProps() {
    return {
      cards: []
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
       responsive: [
         {breakpoint: 600, settings: {slidesToShow: 1,  slidesToScroll: 1}},
         {breakpoint: 950, settings: {slidesToShow: 2,  slidesToScroll: 2}},
         {breakpoint: 1150, settings: {slidesToShow: 3,  slidesToScroll: 3}},
         {breakpoint: 1400, settings: {slidesToShow: 4,  slidesToScroll: 4}},
         {breakpoint: 1700, settings: {slidesToShow: 5,  slidesToScroll: 5}},
          {breakpoint: 2500, settings: {slidesToShow: 6,  slidesToScroll: 6}},
          {breakpoint: 4000, settings: {slidesToShow: 8,  slidesToScroll: 8}}
      ]
     };
     return (
       <div className="card-carousel">
         <Slider ref="slider" {...settings}>
           {this.props.cards.map(function(card){
             return (
               <div key={card.layer.layer_id}>
                 <MapMakerCard {...card} />
              </div>
            );
           })}
         </Slider>
      </div>
     );
  }
});

module.exports = CardCarousel;
