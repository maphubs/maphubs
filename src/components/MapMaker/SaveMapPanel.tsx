import React from 'react'
import { Row, message, Button } from 'antd'
import UserStore from '../../stores/UserStore'
import UserActions from '../../actions/UserActions'
import Formsy from 'formsy-react'
import MultiTextInput from '../forms/MultiTextInput'
import SelectGroup from '../Groups/SelectGroup'

import Locales from '../../services/locales'
import type { UserStoreState } from '../../stores/UserStore'
import { LocalizedString } from '../../types/LocalizedString'
type Props = {
  onSave: (...args: Array<any>) => void
  editing?: boolean
  owned_by_group_id?: string
  title: LocalizedString
  _csrf: string
}
type State = {
  canSave: boolean
  saving?: boolean
} & UserStoreState
export default class SaveMapPanel extends React.Component<Props, State> {
  props: Props

  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [UserStore]
    this.state = {
      canSave: false
    }
  }

  enableSaveButton = (): void => {
    this.setState({
      canSave: true
    })
  }
  disableSaveButton = (): void => {
    this.setState({
      canSave: false
    })
  }
  recheckLogin = (): void => {
    const { t, props } = this
    const { _csrf } = props
    UserActions.getUser(_csrf, (err) => {
      if (err) {
        message.error(t('Not Logged In - Please Login Again'))
      }
    })
  }
  onSave = (model: Record<string, any>): void => {
    const { t, props, state, setState } = this
    const { user } = state
    const { onSave } = props

    model.title = Locales.formModelToLocalizedString(model, 'title')

    if (!model.title || t(model.title) === '') {
      message.error(t('Please Add a Title'))
      return
    }

    if (!model.group && user && user.groups.length === 1) {
      // creating a new layer when user is only the member of a single group (not showing the group dropdown)
      model.group = user.groups[0].group_id
    }

    setState({
      saving: true
    })
    onSave(model, () => {
      setState({
        saving: false
      })
    })
  }

  render(): JSX.Element {
    const {
      t,
      props,
      state,
      onSave,
      enableSaveButton,
      disableSaveButton,
      recheckLogin
    } = this
    const { title, editing, owned_by_group_id } = props
    const { canSave, saving, user } = state
    let groups = []

    if (user && user.groups) {
      groups = user.groups
    }

    return user ? (
      <Formsy
        onValidSubmit={onSave}
        onValid={enableSaveButton}
        onInvalid={disableSaveButton}
      >
        <Row
          style={{
            width: '100%'
          }}
        >
          <MultiTextInput
            name='title'
            id='title'
            value={title}
            label={{
              en: 'Map Title',
              fr: 'Titre de la carte',
              es: 'Título del mapa',
              it: 'Titolo della mappa',
              id: 'Judul Peta',
              pt: 'Título do mapa'
            }}
            validations='maxLength:100'
            validationErrors={{
              maxLength: t('Must be 100 characters or less.')
            }}
            length={100}
            required
            t={t}
          />
        </Row>
        <Row
          style={{
            width: '100%'
          }}
        >
          <SelectGroup
            groups={groups}
            group_id={owned_by_group_id}
            canChangeGroup={!editing}
            editing={editing}
          />
        </Row>
        <Row
          style={{
            width: '100%'
          }}
        >
          <Button
            htmlType='submit'
            style={{
              margin: 'auto'
            }}
            disabled={!canSave || saving}
          >
            {t('Save Map')}
          </Button>
        </Row>
      </Formsy>
    ) : (
      <div>
        <Row
          style={{
            textAlign: 'center'
          }}
        >
          <p>{t('You must login or sign up before saving a map.')}</p>
        </Row>
        <Row
          style={{
            textAlign: 'center'
          }}
        >
          <Button
            type='primary'
            href='/login'
            target='_blank'
            rel='noopener noreferrer'
          >
            {t('Login')}
          </Button>
        </Row>
        <Row
          style={{
            textAlign: 'center'
          }}
        >
          <Button type='primary' onClick={recheckLogin}>
            {t('Retry')}
          </Button>
        </Row>
      </div>
    )
  }
}
