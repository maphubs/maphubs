// @flow
import React from 'react'
import Card from './Card'
import {Row, Col} from 'antd'
import PageSelection from '../UI/PageSelection'
import _chunk from 'lodash.chunk'

import type {CardConfig} from './Card'

  type Props = {
    cards: Array<CardConfig>,
    showAddButton: boolean,
    cardsPerPage: number,
    t: Function
  };

  type State = {
    page: number,
    chunks: NestedArray<CardConfig>
  }

export default class CardGrid extends React.Component<Props, State> {
  static defaultProps = {
    showAddButton: false,
    cardsPerPage: 24,
    cards: []
  }

  constructor (props: Props) {
    super(props)
    const chunks: NestedArray<CardConfig> = _chunk(props.cards, props.cardsPerPage)
    this.state = {
      chunks,
      page: 1
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    const chunks: NestedArray<CardConfig> = _chunk(nextProps.cards, nextProps.cardsPerPage)
    this.setState({
      chunks
    })
  }

  onChangePage = (page: number) => {
    this.setState({page})
  }

  render () {
    const {t, showAddButton} = this.props
    const {chunks, page} = this.state
    const numPages = chunks.length
    const cards: Array<CardConfig> = (chunks[page - 1]: Array<CardConfig>)
    return (
      <div>
        <Row style={{textAlign: 'right'}}>
          <PageSelection page={page} numPages={numPages} onClick={this.onChangePage} />
        </Row>
        <Row type='flex' justify='center' style={{padding: '15px'}}>
          {cards.map((card) => {
            return (
              <Col key={card.id} xs={24} sm={12} md={7} lg={5} xl={4} style={{marginBottom: '10px'}}>
                <Card showAddButton={showAddButton} {...card} t={t} />
              </Col>
            )
          })}
        </Row>
        <Row style={{textAlign: 'right'}}>
          <PageSelection page={page} numPages={numPages} onClick={this.onChangePage} />
        </Row>
      </div>
    )
  }
}
