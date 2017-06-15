//@flow
import React from 'react';
import CardCarousel from './CardCarousel';

import type {CardConfig} from './Card';

type Props =  {
    cards: Array<CardConfig>,
    title: ?string
  }

export default class CardCollection extends React.Component<Props, Props, void> {

  props: Props

  static defaultProps: Props = {
    cards: [],
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