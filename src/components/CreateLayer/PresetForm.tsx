import React, { useState } from 'react'
import Formsy from 'formsy-react'
import TextArea from '../forms/textArea'
import MultiTextInput from '../forms/MultiTextInput'
import Toggle from '../forms/toggle'
import Select from '../forms/select'
import _debounce from 'lodash.debounce'
import Locales from '../../services/locales'
import { Modal, Row, Col, Button } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import useT from '../../hooks/useT'
import { LocalizedString } from '../../types/LocalizedString'

import { useDispatch } from '../../redux/hooks'
import {
  updatePreset,
  deletePreset,
  movePresetUp,
  movePresetDown
} from '../../redux/reducers/layerSlice'
import { MapHubsField } from '../../types/maphubs-field'

const { confirm } = Modal
type Props = {
  id: number
  tag: string
  label: LocalizedString
  type: string
  options: Array<Record<string, any>>
  // if type requires a list of options
  isRequired?: boolean
  showOnMap: boolean
  isName?: boolean
  isDescription?: boolean
  onValid: () => void
  onInvalid: () => void
}
type State = {
  valid: boolean
}
const PresetForm = ({
  id,
  tag,
  type,
  options,
  label,
  showOnMap,
  isName,
  isDescription,
  isRequired,
  onValid,
  onInvalid
}: Props): JSX.Element => {
  const { t } = useT()
  const dispatch = useDispatch()
  const [valid, setValid] = useState(!!tag)

  const onFormChange = (values: MapHubsField) => {
    values.id = id
    values.label = Locales.formModelToLocalizedString(values, 'label')
    values.tag = tag
    dispatch(updatePreset({ id, preset: values }))
  }

  const onRemove = () => {
    confirm({
      title: t('Confirm Removal'),
      content:
        t('Are you sure you want to remove this field?') +
        ' ' +
        t('Note: this will hide the field, but will not delete the raw data.') +
        ' ' +
        t('The field will still be included in data exports.'),
      okType: 'danger',

      onOk() {
        dispatch(deletePreset(id))
      }
    })
  }
  const onMoveUp = () => {
    dispatch(movePresetUp(id))
  }
  const onMoveDown = () => {
    dispatch(movePresetDown(id))
  }

  const presetOptions = [
    {
      value: 'text',
      label: t('Text')
    },
    {
      value: 'localized',
      label: t('Localized Text')
    },
    {
      value: 'number',
      label: t('Number')
    },
    {
      value: 'radio',
      label: t('Radio Buttons (Choose One)')
    },
    {
      value: 'combo',
      label: t('Combo Box (Dropdown)')
    },
    {
      value: 'check',
      label: t('Check Box (Yes/No)')
    }
  ]
  let typeOptions = <></>

  if (type === 'combo' || type === 'radio') {
    typeOptions = (
      <Row>
        <TextArea
          name='options'
          label={t('Options(seperate with commas)')}
          icon='list'
          validations='maxLength:500'
          validationErrors={{
            maxLength: t('Description must be 500 characters or less.')
          }}
          length={500}
          value={options}
          tooltipPosition='top'
          tooltip={t(
            'Comma seperated list of options to show for the Combo or Radio field. Ex: red, blue, green'
          )}
          t={t}
        />
      </Row>
    )
  }

  let typeStartEmpty = true
  if (type) typeStartEmpty = false
  return (
    <>
      <Row>
        <Formsy
          onChange={onFormChange}
          onValid={() => {
            setValid(true)

            const debounced = _debounce(function () {
              if (onValid) this.props.onValid()
            }, 2500).bind(this)

            debounced()
          }}
          onInvalid={() => {
            setValid(false)

            const debounced = _debounce(function () {
              if (onInvalid) onInvalid()
            }, 2500).bind(this)

            debounced()
          }}
          style={{
            width: '100%'
          }}
        >
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <Col sm={24} md={12}>
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                <Select
                  name='type'
                  id='preset-type-select'
                  label={t('Field Type')}
                  options={presetOptions}
                  value={type}
                  startEmpty={typeStartEmpty}
                  required
                />
              </Row>
              <Row
                style={{
                  marginBottom: '20px'
                }}
              >
                <MultiTextInput
                  inputName='label'
                  id={`preset-${id}-label`}
                  label={{
                    en: 'Label',
                    fr: 'Étiquette',
                    es: 'Etiqueta',
                    it: 'Etichetta'
                  }}
                  validations='maxLength:50'
                  validationErrors={{
                    maxLength: t('Must be 50 characters or less.')
                  }}
                  length={50}
                  initialValue={label}
                  required
                />
              </Row>
            </Col>
            <Col
              sm={24}
              md={12}
              style={{
                textAlign: 'center'
              }}
            >
              <Row
                justify='center'
                style={{
                  marginBottom: '20px'
                }}
              >
                <Toggle
                  name='isRequired'
                  labelOff={t('Optional')}
                  labelOn={t('Required')}
                  style={{
                    paddingTop: '25px'
                  }}
                  checked={isRequired}
                />
              </Row>
              <Row
                justify='center'
                style={{
                  marginBottom: '20px'
                }}
              >
                <Toggle
                  name='showOnMap'
                  labelOff={t('Hide in Map')}
                  labelOn={t('Show in Map')}
                  style={{
                    paddingTop: '25px'
                  }}
                  checked={showOnMap}
                />
              </Row>
              <Row
                justify='center'
                style={{
                  marginBottom: '20px'
                }}
              >
                <Toggle
                  name='isName'
                  labelOff={t('Regular Field')}
                  labelOn={t('Name Field')}
                  style={{
                    paddingTop: '25px'
                  }}
                  checked={isName}
                />
              </Row>
              <Row
                justify='center'
                style={{
                  marginBottom: '20px'
                }}
              >
                <Toggle
                  name='isDescription'
                  labelOff={t('Regular Field')}
                  labelOn={t('Description Field')}
                  style={{
                    paddingTop: '25px'
                  }}
                  checked={isDescription}
                />
              </Row>
            </Col>
          </Row>
          {typeOptions}
        </Formsy>
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <Col span={16}>
            <Button
              type='primary'
              onClick={onMoveUp}
              icon={<ArrowUpOutlined />}
            >
              {t('Move Up')}
            </Button>
            <Button
              type='primary'
              style={{
                marginLeft: '5px'
              }}
              onClick={onMoveDown}
              icon={<ArrowDownOutlined />}
            >
              {t('Move Down')}
            </Button>
          </Col>
          <Col
            span={8}
            style={{
              textAlign: 'right'
            }}
          >
            <Button danger onClick={onRemove} icon={<DeleteOutlined />}>
              {t('Remove')}
            </Button>
          </Col>
        </Row>
      </Row>
    </>
  )
}
PresetForm.defaultProps = {
  showOnMap: true
}
export default PresetForm
