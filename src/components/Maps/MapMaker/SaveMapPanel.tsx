import React, { useState } from 'react'
import { Row, message, Button } from 'antd'
import Formsy from 'formsy-react'
import MultiTextInput from '../../forms/MultiTextInput'
import SelectGroup from '../../Groups/SelectGroup'
import useMapT from '../hooks/useMapT'
import Locales from '../../../services/locales'
import { LocalizedString } from '../../../types/LocalizedString'
import { useSession } from 'next-auth/client'

type Props = {
  onSave: (...args: Array<any>) => void
  editing?: boolean
  owned_by_group_id?: string
  title: LocalizedString
}

const SaveMapPanel = ({
  title,
  editing,
  owned_by_group_id,
  onSave
}: Props): JSX.Element => {
  const { t } = useMapT()
  const [session, loading] = useSession()
  const [canSave, setCanSave] = useState(false)
  const [saving, setSaving] = useState(false)

  let user
  if (!loading) {
    user = session.user
  }

  const recheckLogin = (): void => {
    // TODO: trigger next-auth to recheck login
    /*
      if (err) {
        message.error(t('Not Logged In - Please Login Again'))
      }
    */
  }
  const save = (model: Record<string, any>): void => {
    model.title = Locales.formModelToLocalizedString(model, 'title')

    if (!model.title || t(model.title) === '') {
      message.error(t('Please Add a Title'))
      return
    }

    if (!model.group && user && user.groups.length === 1) {
      // creating a new layer when user is only the member of a single group (not showing the group dropdown)
      model.group = user.groups[0].group_id
    }

    setSaving(true)
    onSave(model, () => {
      setSaving(false)
    })
  }

  let groups = []

  if (user && user.groups) {
    groups = user.groups
  }

  return user ? (
    <Formsy
      onValidSubmit={save}
      onValid={() => {
        setCanSave(true)
      }}
      onInvalid={() => {
        setCanSave(false)
      }}
    >
      <Row
        style={{
          width: '100%'
        }}
      >
        <MultiTextInput
          inputName='title'
          id='title'
          initialValue={title}
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
export default SaveMapPanel
