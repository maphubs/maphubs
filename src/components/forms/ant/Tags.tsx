import React, { useState, useRef, useEffect } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Tag, Input, Tooltip } from 'antd'

import useT from '../../../hooks/useT'

type Props = {
  initialTags?: string[]
  onChange?: (tags: string[]) => void
}
type State = {
  tags: string[]
  inputVisible: boolean
  inputValue: string
}
const Tags = ({ initialTags, onChange }: Props): JSX.Element => {
  const input = useRef<Input>()
  const { t } = useT()
  const [tags, setTags] = useState(initialTags || [])
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleClose = (removedTag: string) => {
    const filteredTags = tags.filter((tag) => tag !== removedTag)
    setTags(filteredTags)
    if (onChange) onChange(tags)
  }

  // focus the input once it is visible
  useEffect(() => {
    if (inputVisible) {
      input.current.focus()
    }
  }, [inputVisible])

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue])
    }

    setInputVisible(false)
    setInputValue('')
    if (onChange) onChange(tags)
  }

  return (
    <div>
      {tags.map((tag, index) => {
        if (!tag) return ''
        const isLongTag = tag.length > 20
        const tagElem = (
          <Tag
            key={tag}
            color={process.env.NEXT_PUBLIC_PRIMARY_COLOR}
            closable
            onClose={() => handleClose(tag)}
          >
            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
          </Tag>
        )
        return isLongTag ? (
          <Tooltip title={tag} key={tag}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        )
      })}
      {inputVisible && (
        <Input
          ref={input}
          type='text'
          size='small'
          style={{
            width: 78
          }}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
          }}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      )}
      {!inputVisible && (
        <Tag
          onClick={() => {
            setInputVisible(true)
          }}
          style={{
            background: '#fff',
            borderStyle: 'dashed'
          }}
        >
          <PlusOutlined /> {t('New Tag')}
        </Tag>
      )}
    </div>
  )
}
export default Tags
