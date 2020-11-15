// @flow
import type {Node} from "React";import React from 'react'
import { Row, Col, Typography } from 'antd'
import CardCarousel from './CardCarousel'
import MapHubsComponent from '../MapHubsComponent'

import type {CardConfig} from './Card'

const { Title } = Typography

type Props = {
  cards: Array<CardConfig>,
  title?: string,
  viewAllLink?: string
}

export default class CardCollection extends MapHubsComponent<Props, void> {
  static defaultProps: any | {|cards: Array<any>|} = {
    cards: []
  }

  render (): Node {
    const {t} = this
    const {title, viewAllLink} = this.props

    return (
      <Row style={{marginBottom: '20px'}}>
        <Row style={{marginBottom: '20px'}}>
          <Col span={12}>
            {title && <Title level={3} style={{margin: 0}}>{title}</Title>}
          </Col>
          <Col span={12} style={{textAlign: 'right'}}>
            {viewAllLink &&
              <a
                href={viewAllLink}
              >
                {t('View All')}
              </a>}
          </Col>
        </Row>
        <Row>
          <CardCarousel cards={this.props.cards} infinite={false} t={t} />
        </Row>
      </Row>
    )
  }
}
