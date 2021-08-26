import React, { useContext, useState, useEffect, useRef } from 'react'
import { Input, Form } from 'antd'
const EditableContext = React.createContext()

const EditableRow = ({ index, ...props }: { index: number }) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  dataType,
  ...restProps
}: {
  title: string
  editable: boolean
  children: any
  dataIndex: string
  record: Record<string, any>
  handleSave: (...args: Array<any>) => any
  dataType: string
}): JSX.Element => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<Input>()
  const form = useContext(EditableContext)
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)

    if (!Object.keys(record).includes(dataIndex)) {
      record[dataIndex] = undefined
    }

    form.setFieldsValue({
      [dataIndex]: record[dataIndex]
    })
  }

  const save = async (e) => {
    try {
      const values = await form.validateFields()
      toggleEdit()
      handleSave({ ...record, ...values })
    } catch (err) {
      console.log('Save failed:', err)
    }
  }

  let childNode = children

  if (editable) {
    let input = (
      <Input
        ref={inputRef}
        onBlur={() => {
          toggleEdit()
        }}
        disabled
      />
    )

    if (dataType === 'text') {
      input = <Input ref={inputRef} onPressEnter={save} onBlur={save} />
    }

    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0
        }}
        name={dataIndex}
        rules={
          [
            // {required: true, message: `${title} is required.`} // TODO: support for required fields in table editing
          ]
        }
      >
        {input}
      </Form.Item>
    ) : (
      <div
        className='editable-cell-value-wrap'
        style={{
          paddingRight: 24,
          minHeight: '32px'
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    )
  }

  return <td {...restProps}>{childNode}</td>
}

export { EditableRow, EditableCell }
