import React from 'react'

type Props = {
  defaultValue: string
  onChange: (...args: Array<any>) => any
}
type State = {
  value: string
}
export default class CardFilter extends React.Component<Props, State> {
  static defaultProps:
    | any
    | {
        defaultValue: string
      } = {
    defaultValue: 'featured'
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      value: props.defaultValue
    }
  }

  onFeatured = (): void => {
    this.setState({
      value: 'featured'
    })
    this.props.onChange('featured')
  }
  onPopular = (): void => {
    this.setState({
      value: 'popular'
    })
    this.props.onChange('popular')
  }
  onRecent = (): void => {
    this.setState({
      value: 'recent'
    })
    this.props.onChange('recent')
  }

  render(): JSX.Element {
    const { t, state, onFeatured, onPopular, onRecent } = this
    const { value } = state
    const activeClass = 'omh-accent-text'
    let featuredClass = ''
    let popularClass = ''
    let recentClass = ''

    switch (value) {
      case 'featured': {
        featuredClass = activeClass

        break
      }
      case 'popular': {
        popularClass = activeClass

        break
      }
      case 'recent': {
        recentClass = activeClass

        break
      }
      // No default
    }

    return (
      <div
        className='valign right-align'
        style={{
          width: '100%'
        }}
      >
        <span
          className={featuredClass}
          onClick={onFeatured}
          style={{
            cursor: 'pointer'
          }}
        >
          {t('Featured')}
        </span>{' '}
        |&nbsp;
        <span
          className={popularClass}
          onClick={onPopular}
          style={{
            cursor: 'pointer'
          }}
        >
          {t('Popular')}
        </span>{' '}
        |&nbsp;
        <span
          className={recentClass}
          onClick={onRecent}
          style={{
            cursor: 'pointer'
          }}
        >
          {t('Recent')}
        </span>
      </div>
    )
  }
}
