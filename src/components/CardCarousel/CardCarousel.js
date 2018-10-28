// @flow
import React from 'react'
import Card from './Card'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import type {CardConfig} from './Card'

type Props = {
  cards: Array<CardConfig>,
  showAddButton?: boolean,
  t: Function
}

export default class CardCarousel extends React.Component<Props, void> {
  render () {
    const {cards, t} = this.props
    const count = this.props.cards ? this.props.cards.length : 0

    const Column = ({ index, style }) => {
      const card = cards[index]
      return (
        <div style={style} key={card.id}>
          <Card showAddButton={this.props.showAddButton} t={t} {...card} />
        </div>
      )
    }

    return (
      <div style={{height: '330px'}}>
        <AutoSizer disableHeight>
          {({ width }) => (
            <List
              direction='horizontal'
              height={330}
              itemCount={count}
              itemSize={220}
              width={width}
            >
              {Column}
            </List>
          )}
        </AutoSizer>
      </div>
    )
  }
}
