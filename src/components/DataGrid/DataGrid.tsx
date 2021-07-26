import React, {useState, useRef} from 'react'
import { Row, Button, notification, message, Modal, Input } from 'antd'
import {
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  DownloadOutlined,
  SearchOutlined
} from '@ant-design/icons'
import EditableTable from './Editable/EditableTable'
import slugify from 'slugify'
import Highlighter from 'react-highlight-words'
import turf_bbox from '@turf/bbox'
import GetNameField from '../Map/Styles/get-name-field'
import type { MapHubsField } from '../../types/maphubs-field'
import useT from '../../hooks/useT'
import useUnload from '../../hooks/useUnload'

const { confirm } = Modal
type Props = {
  geoJSON: Record<string, any>
  layer: Record<string, any>
  canEdit: boolean
  presets: Array<MapHubsField>
  containers: {
    dataEditorState: any
    mapState: any
  }
}
type Column = {
  title: string
  dataIndex: string
  width?: number
  editable: boolean
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

const DataGrid = ({layer, presets, geoJSON, canEdit}: Props) => {
  const {t} = useT()
  const tableRef = useRef()

  const rows = geoJSON.features.map((f) => f.properties)
  const rowKey = getRowKey(rows[0])
  const [editing, setEditing] = useState(false)
  const [searchState, setSearchState] = useState<SearchState>({searchText: '', activeSearchTag: null})
  const [selectedRowState, setSelectedRowState] = useState<SelectedRowState>({
    selectedRowKeys: []
  })


  useUnload((e) => {
    e.preventDefault()
    if (editing &&
      containers.dataEditorState.state?.edits?.length > 0) {
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
      presets.forEach((preset) => {
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
          }) => (
            <div
              style={{
                padding: 8
              }}
            >
              <Input
                ref={(node) => {
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
                onClick={() =>
                  handleSearch(preset.tag, selectedKeys, confirm)
                }
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
              setTimeout(() => searchInputsRef.current[[preset.tag]].select())
            }
          },
          render: (text) => {
            return typeof text === 'string' ? (
              <Highlighter
                highlightStyle={{
                  backgroundColor: '#ffc069',
                  padding: 0
                }}
                searchWords={[this.state.searchText]}
                autoEscape
                textToHighlight={text}
              />
            ) : (
              <span>{text}</span>
            )
          }
        })
      })
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
  const onDataChange = async (rowToUpdate: Record<string, any>) => {
    const { dataEditorState, mapState } = containers
    const mapComponent = mapState.state.map
    console.log('data changed')
    console.log(rowToUpdate)
    const mhid = rowToUpdate[selectedRowState.rowKey]
    const featureData = await dataEditorState.selectFeature(mhid)
    // update data
    const data = featureData.properties
    Object.assign(data, rowToUpdate)
    const edit = await dataEditorState.updateSelectedFeatureTags(data)
    mapComponent.onFeatureUpdate(edit.status, edit)
  }
  const onStartEditing = async () => {
    const { dataEditorState } = containers
    await dataEditorState.startEditing(layer)
    setEditing(true)
  }
  const onCancel = () => {
    const { dataEditorState } = containers

    if (dataEditorState.state.edits?.length > 0) {
      confirm({
        title: t('Stop Editing'),
        content: t('Any pending changes will be lost'),
        okText: t('Stop Editing'),
        okType: 'danger',
        onOk: async () => {
          await dataEditorState.stopEditing()
          setEditing(false)
        }
      })
    } else {
      setEditing(false)
    }
  }
  const onSave = () => {
    const { dataEditorState } = containers
    const sourceID = Object.keys(
      dataEditorState.state.editingLayer.style.sources
    )[0]
    dataEditorState.saveEdits((err) => {
      if (err) {
        notification.error({
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        setEditing(false)
        dataEditorState.stopEditing()
        message.success(t('Data Saved'), 1, () => {
          // location.reload()
          reloadEditingSourceCache(sourceID)
        })
      }
    })
  }

  const reloadEditingSourceCache(sourceID: string) {
    const { mapState } = containers
    const mapComponent = mapState.state.map
    const sourceCache = mapComponent.map.style.sourceCaches[sourceID]

    if (sourceCache) {
      // From: https://github.com/mapbox/mapbox-gl-js/issues/2941#issuecomment-518631078
      // Remove the tiles for a particular source
      sourceCache.clearTiles()
      // Load the new tiles for the current viewport (map.transform -> viewport)
      sourceCache.update(mapComponent.map.transform)
      // Force a repaint, so that the map will be repainted without you having to touch the map
      mapComponent.map.triggerRepaint() // mapComponent.reloadStyle()
    }
  }

 const onUndo = () => {
    const { dataEditorState, mapState } = containers
    const mapComponent = mapState.state.map
    dataEditorState.undoEdit((type, edit) => {
      const rowToUndo = edit.geojson.properties
      console.log('undo')
      console.log(rowToUndo)
      tableRef.current.handleSave(rowToUndo, true)
      mapComponent.onFeatureUpdate(type, edit)
    })
  }
  const onRedo = () => {
    const { dataEditorState, mapState } = containers
    const mapComponent = mapState.state.map
    dataEditorState.redoEdit((type, edit) => {
      const rowToRedo = edit.geojson.properties
      console.log('undo')
      console.log(rowToRedo)
      tableRef.current.handleSave(rowToRedo, true)
      mapComponent.onFeatureUpdate(type, edit)
    })
  }
  const onViewSelectedFeature = () => {

    const { selectedFeature } = selectedRowState

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
    setSearchState({
      selectedFeature: undefined,
      selectedRowKeys: []
    })
  }


    const { dataEditorState } = containers
    const name = slugify(t(layer.name))
    const layerId = layer.layer_id
    const csvURL = `/api/layer/${layerId}/export/csv/${name}.csv`
    const rowSelection = {
      type: 'radio',
      // selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        const { mapState } = containers
        const selected = selectedRows[0]
        const idVal = selected[rowKey]
        setSearchState({
          selectedFeature: selected,
          selectedRowKeys
        })

        if (geoJSON) {
          for (const feature of geoJSON.features) {
            if (idVal === feature.properties[rowKey]) {
              const bbox = turf_bbox(feature)
              mapState.state.map.fitBounds(bbox, 16, 25)
            }
          }
        } else {
          console.log('GeoJSON not found, unable to update the map')
        }
      },
      getCheckboxProps: (record) => ({
        name: record[selectedRowState.rowKey]
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
                onClick={this.onViewSelectedFeature}
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
                disabled={dataEditorState.state?.edits.length === 0}
                style={{
                  marginRight: '10px'
                }}
                icon={<UndoOutlined />}
              >
                {t('Undo')}
              </Button>
              <Button
                onClick={onRedo}
                disabled={dataEditorState.state?.redo.length === 0}
                style={{
                  marginRight: '10px'
                }}
                icon={<RedoOutlined />}
              >
                {t('Redo')}
              </Button>
              <Button
                onClick={onSave}
                disabled={dataEditorState.state?.edits.length === 0}
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
            ref={tableRef}
            columns={columns}
            rowKey={rowKey}
            initialDataSource={rows}
            editing={editing}
            onChange={onDataChange}
            rowSelection={rowSelection}
          />
        </Row>
      </Row>
    )
  }

export default DataGrid
