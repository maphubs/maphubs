// @flow
import React from 'react'
import { Table, Select, Input, Button, Avatar, Row } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'
import AutoSizer from 'react-virtualized-auto-sizer'
import slugify from 'slugify'
import type {Layer} from '../../types/layer'
import MapIcon from '@material-ui/icons/Map'
import InfoIcon from '@material-ui/icons/Info'

const { Option } = Select

type Props = {|
  layers: Array<Layer>,
  groups: Array<Object>,
  t: Function
|}

type State = {
  sortedInfo?: Object,
  filteredInfo?: Object,
  searchedColumn?: string,
  searchText?: string
}

export default class LayerList extends React.Component<Props, State> {
  static defaultProps = {
    showTitle: true
  }

  state = {
    sortedInfo: null,
    filteredInfo: null,
    searchText: undefined
  }

  searchInput: any

  handleChange = (pagination: any, filters: any, sorter: any) => {
    // console.log('Various parameters', pagination, filters, sorter)
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter
    })
  }

  handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm()
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex
    })
  };

  handleReset = (clearFilters: any) => {
    clearFilters()
    this.setState({ searchText: '' })
  };

  render () {
    const { layers, groups, t } = this.props
    let { filteredInfo, sortedInfo } = this.state
    sortedInfo = sortedInfo || {}
    filteredInfo = filteredInfo || {}

    const columns = [
      {
        title: 'Preview',
        dataIndex: 'preview',
        key: 'preview',
        width: 100,
        render: (text, record) => (
          <span>
            <a href={`/layer/info/${record.layer_id}/${slugify(t(record.name))}`}>
              <Avatar
                alt={t(record.name)} shape='square' size={64} src={`/img/resize/128?format=webp&url=/api/screenshot/layer/thumbnail/${record.layer_id}.jpg`}
              />
            </a>
          </span>
        )
      },
      {
        title: t('Name'),
        dataIndex: 'name',
        key: 'name',
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              ref={node => {
                this.searchInput = node
              }}
              placeholder={t('Search Name')}
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => this.handleSearch(selectedKeys, confirm, 'name')}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Button
              type='primary'
              onClick={() => this.handleSearch(selectedKeys, confirm, 'name')}
              icon={<SearchOutlined />}
              size='small'
              style={{ width: 90, marginRight: 8 }}
            >
              {t('Search')}
            </Button>
            <Button onClick={() => this.handleReset(clearFilters)} size='small' style={{ width: 90 }}>
              {t('Reset')}
            </Button>
          </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        filteredValue: filteredInfo.name || null,
        onFilter: (value, record) => {
          const currentValue = t(record.name).toString().toLowerCase()
          const compareValue = value.toLowerCase()
          const result = currentValue.includes(compareValue)
          console.log(`filtering: ${currentValue} to ${compareValue} with result ${result}`)
          return result
        },
        onFilterDropdownVisibleChange: visible => {
          if (visible) {
            setTimeout(() => this.searchInput.select())
          }
        },
        render: (text, record) =>
          this.state.searchedColumn === 'name' ? (
            <Highlighter
              highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
              searchWords={[this.state.searchText]}
              autoEscape
              textToHighlight={t(record.name)}
            />
          ) : (
            <span>{t(record.name)}</span>
          ),
        sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
        sorter: (a, b) => {
          const aVal = t(a.name)
          const bVal = t(b.name)
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const aValLower = aVal.toLowerCase()
            const bValLower = bVal.toLowerCase()
            return aValLower.localeCompare(bValLower)
          }
          return 0
        }
      },
      {
        title: 'Group',
        dataIndex: 'owned_by_group_id',
        key: 'group',
        width: 250,
        filters: groups.map(group => { return { text: group.group_id, value: group.group_id } }),
        filteredValue: filteredInfo.group || null,
        onFilter: (value, record) => record.owned_by_group_id === value,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Row style={{marginBottom: '10px'}}>
              <Select
                showSearch
                style={{ width: 200 }}
                placeholder='Select a group'
                optionFilterProp='children'
                onChange={value => setSelectedKeys(value ? [value] : [])}
                filterOption={(input, option) =>
                  // eslint-disable-next-line unicorn/prefer-includes
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {groups.map(group => <Option key={group.group_id} value={group.group_id}>{group.group_id}</Option>)}
              </Select>
            </Row>
            <Row>
              <Button
                type='primary'
                onClick={confirm}
                size='small'
                style={{ width: 90, marginRight: 8 }}
              >
                {t('OK')}
              </Button>
              <Button onClick={clearFilters} size='small' style={{ width: 90 }}>
                {t('Reset')}
              </Button>
            </Row>
          </div>
        ),
        sortOrder: sortedInfo.columnKey === 'group' && sortedInfo.order,
        sorter: (a, b) => {
          const aVal = a.owned_by_group_id
          const bVal = b.owned_by_group_id
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const aValLower = aVal.toLowerCase()
            const bValLower = bVal.toLowerCase()
            return aValLower.localeCompare(bValLower)
          }
          return 0
        }
      },
      {
        title: 'Updated',
        dataIndex: 'last_updated',
        key: 'last_updated',
        width: 200,
        sortOrder: sortedInfo.columnKey === 'last_updated' && sortedInfo.order,
        sorter: (a, b) => {
          const aVal = a.owned_by_group_id
          const bVal = b.owned_by_group_id
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const aValLower = aVal.toLowerCase()
            const bValLower = bVal.toLowerCase()
            return aValLower.localeCompare(bValLower)
          }
          return 0
        }
      },
      {
        title: 'Action',
        key: 'action',
        width: 100,
        render: (text, record) => {
          return (
            <span>
              <a key='open-layer-map' href={`/layer/map/${record.layer_id}/${slugify(t(record.name))}`}><MapIcon /></a>,
              <a key='open-layer-info' href={`/layer/info/${record.layer_id}/${slugify(t(record.name))}`}><InfoIcon /></a>
            </span>
          )
        }
      }
    ]

    let tableTotalWidth = 100
    columns.map(col => {
      if (col.width && typeof col.width === 'number') tableTotalWidth += col.width
    })

    return (
      <AutoSizer>
        {({ height, width }) => (
          <div style={{height: `${height}px`, width: `${width}px`}}>
            <Table
              columns={columns}
              dataSource={layers}
              rowKey='layer_id'
              bordered
              size='small'
              scroll={{ y: height - 100, x: tableTotalWidth }}
              pagination={{
                position: 'bottom',
                pageSize: 100,
                showSizeChanger: true,
                pageSizeOptions: ['50', '100', '200']
              }}
              onChange={this.handleChange}
            />
          </div>
        )}
      </AutoSizer>
    )
  }
}
