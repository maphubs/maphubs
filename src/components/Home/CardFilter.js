// @flow
import React from 'react'
import MapHubsComponent from '../MapHubsComponent'

type Props = {|
  defaultValue: string,
  onChange: Function
|}

type State = {
  value: string
}

export default class CardFilter extends MapHubsComponent<Props, State> {
  static defaultProps = {
    defaultValue: 'featured'
  }

  constructor (props: Props) {
    super(props)
    this.state = {
      value: props.defaultValue
    }
  }

  onFeatured = () => {
    this.setState({value: 'featured'})
    this.props.onChange('featured')
  }

  onPopular = () => {
    this.setState({value: 'popular'})
    this.props.onChange('popular')
  }

  onRecent = () => {
    this.setState({value: 'recent'})
    this.props.onChange('recent')
  }

  render () {
    const {t} = this
    const activeClass = 'omh-accent-text'
    let featuredClass = ''
    let popularClass = ''
    let recentClass = ''
    if (this.state.value === 'featured') {
      featuredClass = activeClass
    } else if (this.state.value === 'popular') {
      popularClass = activeClass
    } else if (this.state.value === 'recent') {
      recentClass = activeClass
    }
    return (
      <div className='valign right-align' style={{width: '100%'}}>
        <span className={featuredClass} onClick={this.onFeatured} style={{cursor: 'pointer'}}>{t('Featured')}</span> |&nbsp;
        <span className={popularClass} onClick={this.onPopular} style={{cursor: 'pointer'}}>{t('Popular')}</span> |&nbsp;
        <span className={recentClass} onClick={this.onRecent} style={{cursor: 'pointer'}}>{t('Recent')}</span>
      </div>
    )
  }
}
