// @flow
import React from 'react'
import { Avatar } from 'antd'
import {IntlProvider, FormattedRelativeTime, FormattedDate} from 'react-intl'
import MapHubsComponent from '../../components/MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import moment from 'moment-timezone'

if (!Intl.PluralRules) {
  require('@formatjs/intl-pluralrules/polyfill')
  require('@formatjs/intl-pluralrules/dist/locale-data/en')
  require('@formatjs/intl-pluralrules/dist/locale-data/es')
  require('@formatjs/intl-pluralrules/dist/locale-data/fr')
  require('@formatjs/intl-pluralrules/dist/locale-data/pt')
  require('@formatjs/intl-pluralrules/dist/locale-data/id')
  require('@formatjs/intl-pluralrules/dist/locale-data/it')
  require('@formatjs/intl-pluralrules/dist/locale-data/de')
}

if (!Intl.RelativeTimeFormat) {
  require('@formatjs/intl-relativetimeformat/polyfill')
  require('@formatjs/intl-relativetimeformat/dist/locale-data/en')
  require('@formatjs/intl-relativetimeformat/dist/locale-data/es')
  require('@formatjs/intl-relativetimeformat/dist/locale-data/pt')
  require('@formatjs/intl-relativetimeformat/dist/locale-data/fr')
  require('@formatjs/intl-relativetimeformat/dist/locale-data/id')
  require('@formatjs/intl-relativetimeformat/dist/locale-data/it')
  require('@formatjs/intl-relativetimeformat/dist/locale-data/de')
}

type Props = {
  story: Object,
  baseUrl: string
}

type State = {
  groupLogoFailed?: boolean
} & LocaleStoreState

export default class StoryHeader extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    baseUrl: ''
  }

  render () {
    const { t } = this
    const { story } = this.props
    const { locale, groupLogoFailed } = this.state
    const guessedTz = moment.tz.guess()
    const date = story.published_at
    const publishedTime = moment.tz(date, guessedTz)
    const daysSincePublished = publishedTime.diff(moment(), 'days')
    const baseUrl = urlUtil.getBaseUrl()

    let authorText = ''
    if (story.author) {
      authorText = t(story.author) + ' - '
    }

    const groupUrl = `${baseUrl}/group/${story.owned_by_group_id}`

    return (
      <div>
        <div style={{height: '40px', marginBottom: '10px'}}>
          <div className='valign-wrapper' style={{width: '36px', float: 'left'}}>
            <a
              className='valign' style={{marginTop: '4px'}}
              href={groupUrl}
            >
              {!groupLogoFailed &&
                <Avatar
                  alt={story.owned_by_group_id} size={36} src={`/img/resize/64?quality=80&progressive=true&url=/group/${story.owned_by_group_id}/thumbnail`} onError={() => {
                    console.error('Group Logo Failed')
                    this.setState({groupLogoFailed: true})
                  }}
                />}
              {groupLogoFailed &&
                <Avatar size={36} style={{ color: '#FFF' }}>
                  {story.owned_by_group_id.charAt(0).toUpperCase()}
                </Avatar>}
            </a>
          </div>
          <div style={{marginLeft: '46px'}}>
            <p
              style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}}
              className='truncate'
            >{authorText}
              <a
                className='valign' style={{marginTop: 0, marginBottom: 0, marginLeft: '5px', fontSize: '14px', lineHeight: '1.4rem'}}
                href={groupUrl}
              >
                {story.groupname ? t(story.groupname) : story.owned_by_group_id}
              </a>
            </p>
            <p style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}}>
              <IntlProvider locale={locale}>
                <FormattedDate value={publishedTime} month='long' day='numeric' year={(daysSincePublished < -365) ? 'numeric' : undefined} />
              </IntlProvider>&nbsp;
              {(daysSincePublished > -365) &&
                <span>(
                  <IntlProvider locale={locale}>
                    <FormattedRelativeTime value={daysSincePublished} numeric='auto' unit='day' />
                  </IntlProvider>)
                </span>}
            </p>
          </div>
        </div>
      </div>
    )
  }
}
