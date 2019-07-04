// @flow
import React from 'react'
import {addLocaleData, IntlProvider, FormattedRelative, FormattedDate} from 'react-intl'
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es'
import fr from 'react-intl/locale-data/fr'
import it from 'react-intl/locale-data/it'
import id from 'react-intl/locale-data/id'
import pt from 'react-intl/locale-data/pt'
import MapHubsComponent from '../../components/MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import moment from 'moment-timezone'
import $ from 'jquery'

addLocaleData(en)
addLocaleData(es)
addLocaleData(fr)
addLocaleData(it)
addLocaleData(id)
addLocaleData(pt)

type Props = {
  story: Object,
  baseUrl: string,
  short: boolean
}

type State = LocaleStoreState;

export default class StoryHeader extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    baseUrl: '',
    short: false
  }

  componentDidMount () {
    $(this.refs.groupimg).on('error', function () {
      $(this).attr('src', 'https://hpvhe47439ygwrt.belugacdn.link/maphubs/assets/missing_group.png')
    })
  }

  render () {
    const { t } = this
    const { story, short } = this.props
    const { locale } = this.state
    const guessedTz = moment.tz.guess()
    const updatedTime = moment.tz(story.updated_at, guessedTz).format()

    let time = ''
    if (short) {
      const daysOld = moment().diff(moment(story.updated_at), 'days')
      if (daysOld < 7) {
        time = (
          <p style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}}>
            <IntlProvider locale={locale}>
              <FormattedRelative value={updatedTime} />
            </IntlProvider>
          </p>
        )
      } else {
        time = (
          <p style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}}>
            <IntlProvider locale={locale}>
              <FormattedDate value={updatedTime} month='short' day='numeric' />
            </IntlProvider>&nbsp;
          </p>
        )
      }
    } else {
      time = (
        <p style={{fontSize: '14px', margin: 0, lineHeight: '1.4rem'}}>
          <IntlProvider locale={locale}>
            <FormattedDate value={updatedTime} month='short' day='numeric' />
          </IntlProvider>&nbsp;
          (<IntlProvider locale={locale}>
            <FormattedRelative value={updatedTime} />
          </IntlProvider>)
        </p>
      )
    }
    const baseUrl = urlUtil.getBaseUrl()

    const groupLogoUrl = `/img/resize/72?url=/group/${story.owned_by_group_id}/thumbnail`
    let authorText = ''
    if (story.author) {
      authorText = story.author + ' - '
    }

    const groupUrl = `${baseUrl}/group/${story.owned_by_group_id}`

    return (
      <div>
        <div style={{height: '40px', marginBottom: '10px'}}>
          <div className='valign-wrapper' style={{width: '36px', float: 'left'}}>
            <a className='valign' style={{marginTop: '4px'}}
              href={groupUrl}>
              <img
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
              className='truncate'>{authorText}
              <a className='valign' style={{marginTop: 0, marginBottom: 0, marginLeft: '5px', fontSize: '14px', lineHeight: '1.4rem'}}
                href={groupUrl}>
                {story.groupname ? t(story.groupname) : story.owned_by_group_id}</a>
            </p>
            {time}
          </div>
        </div>
      </div>
    )
  }
}
