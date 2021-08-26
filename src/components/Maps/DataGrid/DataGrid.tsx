import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { Row, Button, notification, message, Modal, Input } from 'antd'
import {
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  DownloadOutlined,
  SearchOutlined
} from '@ant-design/icons'
import _isequal from 'lodash.isequal'
import EditableTable from './Editable/EditableTable'
import slugify from 'slugify'
import Highlighter from 'react-highlight-words'
import turf_bbox from '@turf/bbox'
import GetNameField from '../Map/Styles/get-name-field'
import type { MapHubsField } from '../../../types/maphubs-field'
import useMapT from '../hooks/useMapT'
import useUnload from '../../../hooks/useUnload'

import { useDispatch, useSelector } from '../redux/hooks'
import { selectMapboxMap } from '../redux/reducers/mapSlice'
import {
  startEditing,
  stopEditing,
  selectFeatureThunk,
  updateSelectedFeatureTags,
  undoEdit,
  redoEdit,
  saveEdits,
  Edit
} from '../redux/reducers/dataEditorSlice'
import { Layer } from '../../../types/layer'
import { FeatureCollection } from 'geojson'
import { SelectValue } from 'antd/lib/select'
import { RowSelectionType } from 'antd/lib/table/interface'

type Props = {
  geoJSON: FeatureCollection
  layer: Layer
  canEdit: boolean
  presets: Array<MapHubsField>
}
type Column = {
  title: string
  dataIndex: string
  width?: number
  editable: boolean
  sorter?: (a: any, b: any) => number | boolean
  sortable?: boolean
  dataType?: string
  filterDropdown?: any
  filterIcon?: any
  onFilter?: any
  onFilterDropdownVisibleChange?: any
  render?: any
}

type SearchState = {
  activeSearchTag?: string
  searchText?: string
}

type SelectedRowState = {
  selectedRowKeys: Array<string>
  selectedFeature?: Record<string, any>
}

const getRowKey = (exampleRow: Record<string, any>) => {
  let rowKey = 'mhid'

  if (exampleRow) {
    if (exampleRow.mhid) {
      rowKey = 'mhid'
    } else if (exampleRow.objectid) {
      rowKey = 'objectid'
    } else if (exampleRow.OBJECTID) {
      rowKey = 'OBJECTID'
    }
  }

  return rowKey
}

const DataGrid = ({ layer, presets, geoJSON, canEdit }: Props): JSX.Element => {
  const { t } = useMapT()
  const router = useRouter()
  const dispatch = useDispatch()
  const tableRef = useRef<any>()
  const searchInputsRef = useRef<Record<string, any>>()

  const rows = geoJSON.features.map((f) => f.properties)
  const rowKey = getRowKey(rows[0])
  const [editing, setEditing] = useState(false)
  const [searchState, setSearchState] = useState<SearchState>({
    searchText: '',
    activeSearchTag: null
  })
  const [selectedRowState, setSelectedRowState] = useState<SelectedRowState>({
    selectedRowKeys: []
  })

  const mapboxMap = useSelector(selectMapboxMap)
  const edits = useSelector((state) => state.dataEditor.edits)
  const redos = useSelector((state) => state.dataEditor.redo)
  const editingLayer = useSelector((state) => state.dataEditor.editingLayer)

  const { selectedFeature } = selectedRowState

  const [dataSource, setDataSource] = useState(rows)

  const handleSave = async (row, isUndoRedo) => {
    const newData = [...dataSource]
    const index = newData.findIndex((item) => row[rowKey] === item[rowKey])
    const prevRow = newData[index]
    newData[index] = row
    setDataSource(newData)

    // if something in the row actualy changed
    if (!_isequal(prevRow, row)) {
      console.log('prevRow')
      console.log(prevRow)
      console.log('newRow')
      console.log(row)
      console.log('newData')
      console.log(newData)
      if (!isUndoRedo) {
        // don't fire a change if this is being called externally as an undo/redo
        console.log('data changed')
        const mhid = row[rowKey]
        const featureData = await dispatch(selectFeatureThunk(mhid)).unwrap()
        // update data
        const data = featureData.selectedEditFeature.geojson.properties
        Object.assign(data, row)
        dispatch(updateSelectedFeatureTags({ data }))
      }
    } else {
      console.info('table edit stopped without changes')
    }
  }

  useUnload((e) => {
    e.preventDefault()
    if (editing && edits?.length > 0) {
      const exit = confirm(t('Any pending changes will be lost'))
      if (exit) window.close()
    }
    window.close()
  })

  const handleReset = (clearFilters: (...args: Array<any>) => any) => {
    clearFilters()
    setSearchState({
      activeSearchTag: undefined,
      searchText: ''
    })
  }
  const handleSearch = (
    tag: string,
    selectedKeys: Array<string>,
    confirm: (...args: Array<any>) => any
  ) => {
    confirm()
    setSearchState({
      activeSearchTag: tag,
      searchText: selectedKeys[0]
    })
  }
  const getColumns = (rows, presets, rowKey) => {
    const firstRow = rows[0]
    const columns: Array<Column> = []
    columns.push({
      dataIndex: rowKey,
      title: 'ID',
      width: 100,
      editable: false,
      sorter: (a, b) => {
        const aVal = a[rowKey]
        const bVal = b[rowKey]
        return aVal > bVal
      }
    })
    let setDynamicSizedColumn

    if (presets) {
      for (const preset of presets) {
        let width

        if (preset.isName) {
          setDynamicSizedColumn = true
        } else {
          width = 150
        }

        columns.push({
          dataIndex: preset.tag,
          title: t(preset.label),
          width,
          sortable: true,
          editable: true,
          dataType: preset.type,
          sorter: (a, b) => {
            const aVal = a[preset.tag]
            const bVal = b[preset.tag]

            if (typeof aVal === 'undefined' || typeof bVal === 'undefined') {
              return 0
            } else if (typeof aVal === 'string' && typeof bVal === 'string') {
              console.log(`comparing string ${aVal} to ${bVal}`)
              const aValLower = aVal.toLowerCase()
              const bValLower = bVal.toLowerCase()
              return aValLower.localeCompare(bValLower)
            } else if (typeof aVal === 'number' && typeof bVal === 'number') {
              console.log(`comparing number ${aVal} to ${bVal}`)
              return aVal > bVal
            } else {
              console.warn('sorting not supported')
              return 0
            }
          },
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
              <Input
                ref={(node) => {
                  if (searchInputsRef.current)
                    searchInputsRef.current[preset.tag] = node
                }}
                placeholder={t('Search')}
                value={selectedKeys[0]}
                disabled={
                  searchState.activeSearchTag &&
                  searchState.activeSearchTag !== preset.tag
                }
                onChange={(e) =>
                  setSelectedKeys(e.target.value ? [e.target.value] : [])
                }
                onPressEnter={() =>
                  handleSearch(preset.tag, selectedKeys, confirm)
                }
                style={{
                  width: 188,
                  marginBottom: 8,
                  display: 'block'
                }}
              />
              <Button
                type='primary'
                onClick={() => handleSearch(preset.tag, selectedKeys, confirm)}
                icon={<SearchOutlined />}
                size='small'
                disabled={
                  searchState.activeSearchTag &&
                  searchState.activeSearchTag !== preset.tag
                }
                style={{
                  width: 90,
                  marginRight: 8
                }}
              >
                Search
              </Button>
              <Button
                onClick={() => handleReset(clearFilters)}
                size='small'
                style={{
                  width: 90
                }}
              >
                Reset
              </Button>
            </div>
          ),
          filterIcon: (filtered) => {
            return !searchState.activeSearchTag ||
              searchState.activeSearchTag === preset.tag ? (
              <SearchOutlined
                style={{
                  color: filtered ? '#1890ff' : undefined
                }}
              />
            ) : (
              ''
            )
          },
          onFilter: (value, record) => {
            if (record[preset.tag] && typeof record[preset.tag] === 'string') {
              return record[preset.tag]
                .toLowerCase()
                .includes(value.toLowerCase())
            }
          },
          onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
              setTimeout(() => searchInputsRef.current[preset.tag].select())
            }
          },
          render: (text) => {
            return typeof text === 'string' ? (
              <Highlighter
                highlightStyle={{
                  backgroundColor: '#ffc069',
                  padding: 0
                }}
                searchWords={[searchState.searchText]}
                autoEscape
                textToHighlight={text}
              />
            ) : (
              <span>{text}</span>
            )
          }
        })
      }
    } else {
      console.warn('table missing presets, using defaults')
      for (const key of Object.keys(firstRow)) {
        columns.push({
          dataIndex: key,
          title: key,
          width: 150,
          editable: false // not safe to edit if presets are not configured
        })
      }
    }

    if (!setDynamicSizedColumn) {
      // make the last column dynamic by removing set width
      const lastCol = columns[columns.length - 1]
      delete lastCol.width
    }

    return columns
  }

  const columns = getColumns(rows, presets, rowKey)

  const onStartEditing = async () => {
    dispatch(startEditing({ layer }))
    setEditing(true)
  }
  const onCancel = () => {
    if (edits?.length > 0) {
      Modal.confirm({
        title: t('Stop Editing'),
        content: t('Any pending changes will be lost'),
        okText: t('Stop Editing'),
        okType: 'danger',
        onOk: async () => {
          dispatch(stopEditing())
          setEditing(false)
        }
      })
    } else {
      setEditing(false)
    }
  }
  const onSave = async () => {
    const sourceID = Object.keys(editingLayer.style.sources)[0]
    try {
      await dispatch(saveEdits(true))
      setEditing(false)
      dispatch(stopEditing())
      message.success(t('Data Saved'), 1, () => {
        // location.reload()
        reloadEditingSourceCache(sourceID)
      })
    } catch (err) {
      notification.error({
        message: t('Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }

  const reloadEditingSourceCache = (sourceID: string) => {
    const sourceCache = mapboxMap.style.sourceCaches[sourceID]

    if (sourceCache) {
      // From: https://github.com/mapbox/mapbox-gl-js/issues/2941#issuecomment-518631078
      // Remove the tiles for a particular source
      sourceCache.clearTiles()
      // Load the new tiles for the current viewport (map.transform -> viewport)
      sourceCache.update(mapboxMap.transform)
      // Force a repaint, so that the map will be repainted without you having to touch the map
      mapboxMap.triggerRepaint() // mapComponent.reloadStyle()
    }
  }

  const onUndo = () => {
    dispatch(
      undoEdit({
        onFeatureUpdate: (type: string, edit: Edit) => {
          const rowToUndo = edit.geojson.properties
          console.log('undo')
          console.log(rowToUndo)
          tableRef.current.handleSave(rowToUndo, true)
        }
      })
    )
  }
  const onRedo = () => {
    dispatch(
      redoEdit({
        onFeatureUpdate: (type: string, edit: Edit) => {
          const rowToRedo = edit.geojson.properties
          console.log('undo')
          console.log(rowToRedo)
          tableRef.current.handleSave(rowToRedo, true)
        }
      })
    )
  }
  const onViewSelectedFeature = () => {
    if (!selectedFeature) {
      return
    }

    let idVal = selectedFeature[rowKey]
    let featureName = 'unknown'
    const nameField = GetNameField.getNameField(selectedFeature, presets)

    if (nameField) {
      featureName = selectedFeature[nameField]
    }

    if (rowKey === 'mhid') {
      idVal = idVal.split(':')[1]
    }

    const url = `/feature/${layer.layer_id}/${idVal}/${slugify(featureName)}`
    router.push(url)
  }
  const onClearSelection = () => {
    setSelectedRowState({
      selectedFeature: undefined,
      selectedRowKeys: []
    })
  }

  const name = slugify(t(layer.name))
  const layerId = layer.layer_id
  const csvURL = `/api/layer/${layerId}/export/csv/${name}.csv`
  const rowSelection = {
    type: 'radio' as RowSelectionType,
    // selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      const selected = selectedRows[0]
      const idVal = selected[rowKey]
      setSelectedRowState({
        selectedFeature: selected,
        selectedRowKeys
      })

      if (geoJSON) {
        for (const feature of geoJSON.features) {
          if (idVal === feature.properties[rowKey]) {
            const bbox = turf_bbox(feature) as [number, number, number, number]
            mapboxMap.fitBounds(bbox, {
              padding: 25,
              curve: 1,
              speed: 0.6,
              maxZoom: 26,
              animate: true
            })
          }
        }
      } else {
        console.log('GeoJSON not found, unable to update the map')
      }
    },
    getCheckboxProps: (record) => ({
      name: record[rowKey]
    })
  }
  return (
    <Row>
      <Row
        justify='end'
        align='middle'
        style={{
          height: '50px',
          padding: '0px 10px'
        }}
      >
        {!editing && selectedFeature && (
          <>
            <Button
              style={{
                marginRight: '10px'
              }}
              onClick={onClearSelection}
            >
              {t('Clear Selection')}
            </Button>
            <Button
              style={{
                marginRight: '10px'
              }}
              onClick={onViewSelectedFeature}
            >
              {t('View Selected')}
            </Button>
          </>
        )}
        {!editing && !layer.disable_export && (
          <Button
            href={csvURL}
            style={{
              marginRight: '10px'
            }}
            icon={<DownloadOutlined />}
          >
            {t('Download CSV')}
          </Button>
        )}
        {!editing && canEdit && (
          <Button onClick={onStartEditing}>{t('Edit')}</Button>
        )}
        {editing && (
          <>
            <Button
              onClick={onUndo}
              disabled={edits.length === 0}
              style={{
                marginRight: '10px'
              }}
              icon={<UndoOutlined />}
            >
              {t('Undo')}
            </Button>
            <Button
              onClick={onRedo}
              disabled={redos.length === 0}
              style={{
                marginRight: '10px'
              }}
              icon={<RedoOutlined />}
            >
              {t('Redo')}
            </Button>
            <Button
              onClick={onSave}
              disabled={edits.length === 0}
              type='primary'
              style={{
                marginRight: '10px'
              }}
              icon={<SaveOutlined />}
            >
              {t('Save')}
            </Button>
            <Button onClick={onCancel} danger>
              {t('Cancel')}
            </Button>
          </>
        )}
      </Row>
      <Row
        style={{
          height: 'calc(100% - 50px)'
        }}
      >
        <EditableTable
          columns={columns}
          rowKey={rowKey}
          dataSource={dataSource}
          editing={editing}
          handleSave={handleSave}
          rowSelection={rowSelection}
        />
      </Row>
    </Row>
  )
}

export default DataGrid
