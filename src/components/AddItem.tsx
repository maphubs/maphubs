import React, { useState } from 'react'
import { Row, Col, Button } from 'antd'
import Formsy from 'formsy-react'
import Toggle from './forms/toggle'
import SearchBox from './SearchBox'
type Props = {
  placeholder: string
  suggestionUrl: string
  onAdd: (v: { value: Value; option: boolean }) => void
  optionLabel: string
  optionLabelOn: string
  optionLabelOff: string
  addButtonLabel: string
}
type Value = {
  key: string
  value: string
}
type State = {
  value?: Value
  option: boolean
}

const AddItem = ({
  suggestionUrl,
  placeholder,
  optionLabel,
  optionLabelOn,
  optionLabelOff,
  addButtonLabel,
  onAdd
}: Props): JSX.Element => {
  const [option, setOption] = useState(false)
  const [value, setValue] = useState<Value>()

  const resetSearch = () => {
    setValue(null)
    setOption(false)
  }

  const handleSearch = (input?: string) => {
    if (!input) {
      resetSearch()
    } else {
      setValue({
        key: input,
        value: input
      })
    }
  }
  const submit = (e: any) => {
    e.preventDefault()
    if (!value) return
    onAdd({
      value,
      option
    })
    // reset form
    resetSearch()
  }

  return (
    <>
      <Row
        justify='center'
        align='middle'
        style={{
          marginBottom: '20px'
        }}
      >
        <SearchBox
          label={placeholder}
          suggestionUrl={suggestionUrl}
          onSearch={handleSearch}
          onReset={resetSearch}
        />
      </Row>

      <Row justify='center' align='middle'>
        <Col span={12}>
          <Formsy>
            <Toggle
              name='admin'
              onChange={setOption}
              labelOff={optionLabelOff}
              labelOn={optionLabelOn}
              checked={option}
              tooltipPosition='top'
              tooltip={optionLabel}
            />
          </Formsy>
        </Col>

        <Col
          span={12}
          style={{
            textAlign: 'right'
          }}
        >
          <Button type='primary' onClick={submit}>
            {addButtonLabel}
          </Button>
        </Col>
      </Row>
    </>
  )
}
export default AddItem
