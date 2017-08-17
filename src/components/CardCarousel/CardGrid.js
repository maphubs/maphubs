//@flow
import React from 'react';
import Card  from './Card';
import PageSelection from '../UI/PageSelection';
import _chunk from 'lodash.chunk';

import type {CardConfig} from './Card';

  type Props = {
    cards: Array<CardConfig>,
    showAddButton: boolean,
    cardsPerPage: number
  };

  type State = {
    page: number,
    chunks: NestedArray<CardConfig>
  }

export default class CardGrid extends React.Component<Props, State> {

  props: Props

  static defaultProps = {
    showAddButton: false,
    cardsPerPage: 24
  }

  state: State

  constructor(props: Props){
    super(props);
    let chunks: NestedArray<CardConfig> = _chunk(props.cards, props.cardsPerPage);
    this.state = {
      chunks,
      page: 1
    };
  }

  componentWillReceiveProps(nextProps: Props){
    let chunks: NestedArray<CardConfig> = _chunk(nextProps.cards, nextProps.cardsPerPage);
    this.setState({
      chunks
    });
  }

  onChangePage = (page: number) => {
    this.setState({page});
  }

  render() {
    let numPages = this.state.chunks.length;
    let cards: Array<CardConfig> = (this.state.chunks[this.state.page-1]: Array<CardConfig>);
     return (
       <div>
         <div className="row no-margin right-align">
          <PageSelection page={this.state.page} numPages={numPages} onClick={this.onChangePage} />
        </div>
         <div className="row">
        {cards.map((card) => {
             return (
               <div key={card.id} className="col s12 m4 l3">
                 <Card showAddButton={this.props.showAddButton} {...card} />
              </div>
            );
           })}
        </div>
        <div className="row right-align">
          <PageSelection page={this.state.page} numPages={numPages} onClick={this.onChangePage} />
        </div>
      </div>
     );
  }
}