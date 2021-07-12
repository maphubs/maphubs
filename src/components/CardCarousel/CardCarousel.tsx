import React from 'react'
import Card from './Card'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import type { CardConfig } from './Card'
import { Empty, Row } from 'antd'
import useT from '../../hooks/useT'
type Props = {
  cards: Array<CardConfig>
  showAddButton?: boolean
  emptyMessage?: Record<string, any>
}
const CardCarousel = ({
  emptyMessage,
  showAddButton,
  cards
}: Props): JSX.Element => {
  const { t } = useT()
  const count = cards ? cards.length : 0
  if (count === 0) {
    return (
      <Row
        justify='center'
        align='middle'
        style={{
          height: '330px',
          width: '100%'
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span
              style={{
                color: '#323333'
              }}
            >
              {t(emptyMessage)}
            </span>
          }
        />
      </Row>
    )
  }

  const Column = ({
    index,
    style
  }: {
    index: number
    style: React.CSSProperties
  }) => {
    const cardConfig = cards ? cards[index] : { id: undefined }
    return (
      <div style={style} key={cardConfig.id}>
        <div
          style={{
            flex: '0 0 330px',
            height: 200,
            margin: '0 10px'
          }}
        >
          <Card showAddButton={showAddButton} {...cardConfig} />
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        height: '330px',
        width: '100%'
      }}
    >
      <AutoSizer disableHeight>
        {({ width }) => {
          let maxWidth = width
          const requiredWidth = 220 * count

          if (requiredWidth < width) {
            maxWidth = requiredWidth
          }

          return (
            <div
              style={{
                width
              }}
            >
              <List
                direction='horizontal'
                height={330}
                itemCount={count}
                itemSize={220}
                width={maxWidth}
                style={{
                  margin: 'auto'
                }}
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
export default CardCarousel
