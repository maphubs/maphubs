import React, { useState, useRef } from 'react'
import { Row, Input } from 'antd'
import Suggestions from './Suggestions'
import useBodyClick from '../../hooks/useBodyClick'
const { Search } = Input
type Suggestion = {
  key: string
  value: string
}
type Props = {
  placeholder: string
  onReset: () => void
  onSubmit: (value: string) => void
  onChange: (value: string, resolve: (value: unknown) => void) => void
}
type State = {
  value: string
  suggestions: Array<Suggestion>
}
const SearchBar = ({
  placeholder,
  onReset,
  onSubmit,
  onChange
}: Props): JSX.Element => {
  const timer = useRef<NodeJS.Timeout>()
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  useBodyClick((e) => {
    console.log(e)
    if (e?.target?.parentElement?.classList.contains('dropdown-content-item'))
      return
    setSuggestions([])
  })

  const fillInSuggestion = (suggestion: Suggestion) => {
    search(suggestion.value)
  }

  const handleChange = (e) => {
    clearTimeout(timer.current)
    const input = e.target.value
    setValue(input)

    if (input) {
      timer.current = setTimeout(() => {
        new Promise((resolve) => {
          onChange(input, resolve)
        }).then((suggestionsUpdate: Suggestion[]) => {
          if (!value) return
          setSuggestions(suggestionsUpdate)
        })
      }, 250)
    } else {
      reset()
    }
  }
  const search = (valueUpdate: string) => {
    if (valueUpdate && typeof valueUpdate === 'string') {
      clearTimeout(timer.current)
      onSubmit(valueUpdate)
      setSuggestions([])
      setValue(valueUpdate)
    } else {
      reset()
    }
  }
  const reset: () => void = () => {
    clearTimeout(timer.current)
    setSuggestions([])
    setValue('')
    if (onReset) onReset()
  }

  return (
    <>
      <Row>
        <Search
          placeholder={placeholder}
          onSearch={search}
          enterButton
          size='large'
          onPressEnter={() => {
            search(value)
          }}
          onChange={handleChange}
          allowClear
          value={value}
        />
      </Row>
      <Row
        style={{
          position: 'relative'
        }}
      >
        {suggestions?.length > 0 && (
          <Suggestions
            suggestions={suggestions}
            onSelection={fillInSuggestion}
          />
        )}
      </Row>
    </>
  )
}
export default SearchBar
