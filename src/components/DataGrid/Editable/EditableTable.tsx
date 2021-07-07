import React from 'react'
import { Table } from 'antd'
import AutoSizer from 'react-virtualized-auto-sizer'
import _isequal from 'lodash.isequal'
import { EditableRow, EditableCell } from './EditableRow'
type Props = {
  columns: Array<{
    title: string
    dataIndex: string
    width?: number | string
    editable: boolean
  }>
  dataSource: Array<Record<string, any>>
  editing?: boolean
  rowKey: string
  rowSelection: {
    type: string
    onChange: (...args: Array<any>) => any
    getCheckboxProps: (...args: Array<any>) => any
  }
  onChange: (...args: Array<any>) => any // called each time a cell is changed
}
type State = {
  edits: Array<Record<string, any>>
}
export default class EditableTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      dataSource: props.dataSource
    }
  }

  handleSave = (row, isUndoRedo): void => {
    const { rowKey, onChange } = this.props
    const newData = [...this.state.dataSource]
    const index = newData.findIndex((item) => row[rowKey] === item[rowKey])
    const prevRow = newData[index]
    newData[index] = row
    // newData.splice(index, 1, { ...item, ...row })
    this.setState({
      dataSource: newData
    })

    // if something in the row actualy changed
    if (!_isequal(prevRow, row)) {
      console.log('prevRow')
      console.log(prevRow)
      console.log('newRow')
      console.log(row)
      console.log('newData')
      console.log(newData)
      if (!isUndoRedo) onChange(row) // don't fire a change if this is being called externally as an undo/redo
    } else {
      console.info('table edit stopped without changes')
    }
  }

  render(): JSX.Element {
    const { editing, columns, rowKey, rowSelection } = this.props
    const { dataSource } = this.state
    console.log('table render')
    console.log(dataSource)
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell
      }
    }
    let tableTotalWidth = 150
    const columnsWithUI = columns.map((col) => {
      // track total width for X scroll size
      if (col.width && typeof col.width === 'number')
        tableTotalWidth += col.width

      // if this column isn't editble we don't need anything extra
      if (!col.editable || !editing) {
        return col
      }

      // add onCell handler sends props to the custom cell renderer
      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          dataType: col.dataType,
          title: col.title,
          handleSave: this.handleSave
        }),
        onRow: (record) => ({
          key: record[rowKey]
        })
      }
    })
    return (
      <AutoSizer>
        {({ height, width }) => (
          <div
            style={{
              height: `${height}px`,
              width: `${width}px`
            }}
          >
            <Table
              rowKey={rowKey || 'id'}
              components={components}
              rowClassName={() => 'editable-row'}
              bordered
              size='small'
              dataSource={dataSource}
              columns={columnsWithUI}
              scroll={{
                y: height - 100,
                x: tableTotalWidth
              }}
              rowSelection={rowSelection}
              pagination={{
                position: 'bottom',
                pageSize: 100,
                showSizeChanger: true,
                pageSizeOptions: ['50', '100', '200']
              }}
            />
            <style jsx global>
              {`
                editable-cell {
                  position: relative;
                }

                .editable-cell-value-wrap {
                  padding: 5px 12px;
                  cursor: pointer;
                }

                .editable-row:hover .editable-cell-value-wrap {
                  border: 1px solid #d9d9d9;
                  border-radius: 4px;
                  padding: 4px 11px;
                }

                [data-theme='dark']
                  .editable-row:hover
                  .editable-cell-value-wrap {
                  border: 1px solid #434343;
                }
              `}
            </style>
          </div>
        )}
      </AutoSizer>
    )
  }
}
