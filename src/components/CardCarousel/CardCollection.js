// @flow
import React from 'react'
import CardCarousel from './CardCarousel'
import MapHubsComponent from '../MapHubsComponent'

import type {CardConfig} from './Card'

type Props = {
  cards: Array<CardConfig>,
  title?: string,
  viewAllLink?: string
}

type DefaultProps = {
  cards: Array<CardConfig>
}

export default class CardCollection extends MapHubsComponent<Props, void> {
  props: Props

  static defaultProps: DefaultProps = {
    cards: []
  }

  render () {
    let title = ''
    if (this.props.title) {
      title = (
        <h5>{this.props.title}</h5>
      )
    }

    let viewAllLink = ''
    if (this.props.viewAllLink) {
      viewAllLink = (
        <a
          style={{position: 'absolute', right: '5px', top: '14px'}}
          href={this.props.viewAllLink}
        >
          {this.__('View All')}
        </a>
      )
    }
    return (
      <div className='row'>
        <div className='col s12' style={{position: 'relative'}}>
          {title}
          {viewAllLink}
          <div className='divider' />
          <CardCarousel cards={this.props.cards} infinite={false} />
        </div>
      </div>
    )
  }
}
