// @flow
import React from 'react'
import {IntlProvider, FormattedRelativeTime} from 'react-intl'

import MapHubsComponent from '../../components/MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import moment from 'moment-timezone'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import $ from 'jquery'

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
  map: Object,
  group: {
    group_id: string,
    name: LocalizedString
  }
}

type State = LocaleStoreState;

export default class MapCardGroupTag extends MapHubsComponent<Props, State> {
  props: Props

  componentDidMount () {
    $(this.refs.groupimg).on('error', function () {
      $(this).attr('src', 'https://hpvhe47439ygwrt.belugacdn.link/maphubs/assets/missing_group.png')
    })
  }

  render () {
    const { t } = this
    const { map, group } = this.props
    const { locale } = this.state
    const guessedTz = moment.tz.guess()
    const updatedTime = moment.tz(map.updated_at, guessedTz).format()

    const baseUrl = urlUtil.getBaseUrl()
    const linkUrl = `${baseUrl}/group/${group.group_id}`
    const groupLogoUrl = `/img/resize/72?url=/group/${this.props.story.owned_by_group_id}/thumbnail`

    return (
      <div>
        <div style={{height: '40px', marginBottom: '10px'}}>
          <div className='valign-wrapper' style={{width: '36px', float: 'left'}}>
            <a className='valign' style={{marginTop: '4px'}} href={linkUrl}>
              <img
                ref='groupimg'
                className='circle valign'
                height='36' width='36'
                style={{height: '36px', width: '36px', border: '1px solid #bbbbbb'}}
                src={groupLogoUrl}
                alt='Group Logo'
              />
            </a>
          </div>
          <div style={{marginLeft: '46px'}}>
            <p
              style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}}
              className='truncate'
            >
              <a
                className='valign'
                style={{marginTop: 0, marginBottom: 0, marginLeft: '5px', fontSize: '14px', lineHeight: '1.4rem'}}
                href={linkUrl}
              >
                {t(group.name)}
              </a>
            </p>
            <p style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}}>
              <IntlProvider locale={locale}>
                <FormattedRelativeTime value={updatedTime} />
              </IntlProvider>
            </p>
          </div>
        </div>
      </div>
    )
  }
}
