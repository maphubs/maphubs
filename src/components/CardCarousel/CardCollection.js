//@flow
import React from 'react';
import CardCarousel from './CardCarousel';

export default class CardCollection extends React.Component {

  props: {
    cards: Array<Object>,
    title: string
  }

  static defaultProps: {
    title: null
  }

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
}