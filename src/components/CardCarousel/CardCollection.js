// @flow
import React from 'react'
import { Row, Divider } from 'antd'
import CardCarousel from './CardCarousel'
import MapHubsComponent from '../MapHubsComponent'

import type {CardConfig} from './Card'

type Props = {
  cards: Array<CardConfig>,
  title?: string,
  viewAllLink?: string
}

export default class CardCollection extends MapHubsComponent<Props, void> {
  static defaultProps = {
    cards: []
  }

  render () {
    const {t} = this
    const {title, viewAllLink} = this.props

    return (
      <Row style={{marginBottom: '20px'}}>
        <div style={{position: 'relative'}}>
          {title && <h5>{title}</h5>}
          {viewAllLink &&
            <a
              style={{position: 'absolute', right: '5px', top: '14px'}}
              href={viewAllLink}
            >
              {t('View All')}
            </a>}
          <Divider />
          <CardCarousel cards={this.props.cards} infinite={false} t={t} />
        </div>
      </Row>
    )
  }
}
