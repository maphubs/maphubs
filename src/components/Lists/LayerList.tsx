import React, { useState, useRef } from 'react'
import { Table, Select, Input, Button, Avatar, Row } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined } from '@ant-design/icons'
import AutoSizer from 'react-virtualized-auto-sizer'
import slugify from 'slugify'
import type { Layer } from '../../types/layer'
import MapIcon from '@material-ui/icons/Map'
import InfoIcon from '@material-ui/icons/Info'
import useT from '../../hooks/useT'
import { Group } from '../../types/group'
import { SelectValue } from 'antd/lib/select'
const { Option } = Select
type Props = {
  layers: Layer[]
  groups: Group[]
}
type SearchState = {
  searchedColumn?: string
  searchText?: string
}
type FilterState = {
  sortedInfo?: Record<string, any>
  filteredInfo?: Record<string, any>
}
const LayerList = ({ layers, groups }: Props): JSX.Element => {
  const searchInput = useRef<Input>()
  const { t } = useT()
  const [searchState, setSearchState] = useState<SearchState>()
  const [filterState, setFilterState] = useState<FilterState>({
    filteredInfo: {},
    sortedInfo: {}
  })

  const handleChange = (pagination: any, filters: any, sorter: any) => {
    // console.log('Various parameters', pagination, filters, sorter)
    setFilterState({
      filteredInfo: filters,
      sortedInfo: sorter
    })
  }
  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: string
  ) => {
    confirm()
    setSearchState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex
    })
  }
  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchState({
      searchText: '',
      searchedColumn: undefined
    })
  }

  let { filteredInfo, sortedInfo } = filterState
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
              alt={t(record.name)}
              shape='square'
              size={64}
              src={`/api/screenshot/layer/thumbnail/${record.layer_id}.jpg`}
            />
          </a>
        </span>
      )
    },
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters
      }: {
        setSelectedKeys: (v: string[]) => void
        selectedKeys: string[]
        confirm: () => void
        clearFilters: () => void
      }) => (
        <div
          style={{
            padding: 8
          }}
        >
          <Input
            ref={searchInput}
            placeholder={t('Search Name')}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => handleSearch(selectedKeys, confirm, 'name')}
            style={{
              width: 188,
              marginBottom: 8,
              display: 'block'
            }}
          />
          <Button
            type='primary'
            onClick={() => handleSearch(selectedKeys, confirm, 'name')}
            icon={<SearchOutlined />}
            size='small'
            style={{
              width: 90,
              marginRight: 8
            }}
          >
            {t('Search')}
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size='small'
            style={{
              width: 90
            }}
          >
            {t('Reset')}
          </Button>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined
          style={{
            color: filtered ? '#1890ff' : undefined
          }}
        />
      ),
      filteredValue: filteredInfo.name,
      onFilter: (value, record) => {
        const currentValue = t(record.name).toString().toLowerCase()
        const compareValue = value.toLowerCase()
        const result = currentValue.includes(compareValue)
        console.log(
          `filtering: ${currentValue} to ${compareValue} with result ${result}`
        )
        return result
      },
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current.select())
        }
      },
      render: (text, record) =>
        searchState.searchedColumn === 'name' ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0
            }}
            searchWords={[searchState.searchText]}
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
      filters: groups.map((group) => {
        return {
          text: group.group_id,
          value: group.group_id
        }
      }),
      filteredValue: filteredInfo.group,
      onFilter: (value, record) => record.owned_by_group_id === value,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters
      }: {
        setSelectedKeys: (v: SelectValue[]) => void
        selectedKeys: string[]
        confirm: () => void
        clearFilters: () => void
      }) => (
        <div
          style={{
            padding: 8
          }}
        >
          <Row
            style={{
              marginBottom: '10px'
            }}
          >
            <Select
              showSearch
              style={{
                width: 200
              }}
              placeholder='Select a group'
              optionFilterProp='children'
              onChange={(value) => setSelectedKeys(value ? [value] : [])}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {groups.map((group) => (
                <Option key={group.group_id} value={group.group_id}>
                  {group.group_id}
                </Option>
              ))}
            </Select>
          </Row>
          <Row>
            <Button
              type='primary'
              onClick={confirm}
              size='small'
              style={{
                width: 90,
                marginRight: 8
              }}
            >
              {t('OK')}
            </Button>
            <Button
              onClick={clearFilters}
              size='small'
              style={{
                width: 90
              }}
            >
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
        const aVal = a.last_updated
        const bVal = b.last_updated

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
            <a
              key='open-layer-map'
              href={`/layer/map/${record.layer_id}/${slugify(t(record.name))}`}
            >
              <MapIcon />
            </a>
            ,
            <a
              key='open-layer-info'
              href={`/layer/info/${record.layer_id}/${slugify(t(record.name))}`}
            >
              <InfoIcon />
            </a>
          </span>
        )
      }
    }
  ]
  let tableTotalWidth = 100
  for (const col of columns) {
    if (col.width && typeof col.width === 'number') tableTotalWidth += col.width
  }
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
            columns={columns}
            dataSource={layers}
            rowKey='layer_id'
            bordered
            size='small'
            scroll={{
              y: height - 100,
              x: tableTotalWidth
            }}
            pagination={{
              position: ['bottomRight'],
              pageSize: 100,
              showSizeChanger: true,
              pageSizeOptions: ['50', '100', '200']
            }}
            onChange={handleChange}
          />
        </div>
      )}
    </AutoSizer>
  )
}
export default LayerList
