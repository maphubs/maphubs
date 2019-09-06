// @flow
import React from 'react'
import Card from './Card'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import type {CardConfig} from './Card'
import { Empty, Row } from 'antd'

type Props = {
  cards: Array<CardConfig>,
  showAddButton?: boolean,
  t: Function,
  emptyMessage?: Object
}

export default class CardCarousel extends React.Component<Props, void> {
  render () {
    const { t, emptyMessage } = this.props
    let { cards } = this.props
    if (!cards) cards = []
    const count = cards.length
    if (count === 0) {
      return (
        <Row style={{height: '330px', paddingTop: '100px'}}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{color: '#323333'}}>{t(emptyMessage)}</span>}
          />
        </Row>
      )
    }

    const Column = ({ index, style }) => {
      const cardConfig = cards ? cards[index] : {}
      return (
        <div style={style} key={cardConfig.id}>
          <div style={{
            flex: '0 0 330px',
            height: 200,
            margin: '0 10px'
          }}
          >
            <Card showAddButton={this.props.showAddButton} t={t} {...cardConfig} />
          </div>
        </div>
      )
    }

    return (
      <div style={{height: '330px'}}>
        <AutoSizer disableHeight>
          {({ width }) => {
            let maxWidth = width
            const requiredWidth = 220 * count
            if (requiredWidth < width) {
              maxWidth = requiredWidth
            }
            return (
              <div style={{width}}>
                <List
                  direction='horizontal'
                  height={330}
                  itemCount={count}
                  itemSize={220}
                  width={maxWidth}
                  style={{margin: 'auto'}}
                >
                  {Column}
                </List>
              </div>
            )
          }}
        </AutoSizer>
      </div>
    )
  }
}
