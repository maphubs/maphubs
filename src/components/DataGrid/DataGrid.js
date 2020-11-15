// @flow
import React from 'react'
import { Row, Button, notification, message, Modal, Input } from 'antd'
import { UndoOutlined, RedoOutlined, SaveOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import EditableTable from './Editable/EditableTable'
import MapContainer from '../Map/containers/MapContainer'
import DataEditorContainer from '../Map/containers/DataEditorContainer'
import { subscribe } from '../Map/containers/unstated-props'
import slugify from 'slugify'
import Highlighter from 'react-highlight-words'
import turf_bbox from '@turf/bbox'
import GetNameField from '../Map/Styles/get-name-field'

import type {MapHubsField} from '../../types/maphubs-field'
const { confirm } = Modal
type Props = {
  geoJSON: Object,
  presets: Object,
  layer: Object,
  canEdit: boolean,
  presets: Array<MapHubsField>,
  containers: {dataEditorState: any, mapState: any},
  t: Function,
  _csrf: string
}

type Column = {
  title: string,
  dataIndex: string,
  width?: number,
  editable: boolean
}

type State = {
  editing: boolean,
  columns: Array<Column>,
  rows: Array<Object>,
  rowKey: string, // the data index of the unique ID attribute, usually the 'mhid'
  activeSearchTag?: string,
  searchText?: string,
  selectedRowKeys: Array<string>,
  selectedFeature?: Object
}

const getRowKey = (exampleRow: Object) => {
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

class DataGrid extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    const rows = props.geoJSON.features.map(f => f.properties)
    const rowKey = getRowKey(rows[0])
    this.state = {
      editing: false,
      columns: this.getColumns(rows, props.presets, rowKey, props.t),
      rows,
      rowKey,
      selectedRowKeys: []
    }
    this.searchInputs = {}
  }

  tableRef: any
  searchInputs: any
  unloadHandler: any

  componentDidMount () {
    const _this = this
    this.unloadHandler = (e) => {
      if (_this.state.editing && _this.props.containers.dataEditorState.state?.edits?.length > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', this.unloadHandler)
  }

  componentWillUnmount () {
    window.removeEventListener('beforeunload', this.unloadHandler)
  }

  handleReset = (clearFilters: Function) => {
    clearFilters()
    this.setState({ activeSearchTag: undefined, searchText: '' })
  }

  handleSearch = (tag: string, selectedKeys: Array<string>, confirm: Function) => {
    confirm()
    this.setState({ activeSearchTag: tag, searchText: selectedKeys[0] })
  }

  getColumns = (rows, presets, rowKey, t) => {
    const firstRow = rows[0]

    const columns: Array<Column> = []
    columns.push(
      {
        dataIndex: rowKey,
        title: 'ID',
        width: 100,
        editable: false,
        sorter: (a, b) => {
          const aVal = a[rowKey]
          const bVal = b[rowKey]
          return aVal > bVal
        }
      }
    )
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
            setSelectedKeys, selectedKeys, confirm, clearFilters
          }) => (
            <div style={{ padding: 8 }}>
              <Input
                ref={node => { this.searchInputs[preset.tag] = node }}
                placeholder={t('Search')}
                value={selectedKeys[0]}
                disabled={this.state.activeSearchTag && (this.state.activeSearchTag !== preset.tag)}
                onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => this.handleSearch(preset.tag, selectedKeys, confirm)}
                style={{ width: 188, marginBottom: 8, display: 'block' }}
              />
              <Button
                type='primary'
                onClick={() => this.handleSearch(preset.tag, selectedKeys, confirm)}
                icon={<SearchOutlined />}
                size='small'
                disabled={this.state.activeSearchTag && (this.state.activeSearchTag !== preset.tag)}
                style={{ width: 90, marginRight: 8 }}
              >
                Search
              </Button>
              <Button
                onClick={() => this.handleReset(clearFilters)}
                size='small'
                style={{ width: 90 }}
              >
                Reset
              </Button>
            </div>
          ),
          filterIcon: (filtered) => {
            if (!this.state.activeSearchTag || (this.state.activeSearchTag === preset.tag)) {
              return <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
            } else {
              return ''
            }
          },
          onFilter: (value, record) => {
            if (record[preset.tag] && typeof record[preset.tag] === 'string') {
              return record[preset.tag].toLowerCase().includes(value.toLowerCase())
            }
          },
          onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
              setTimeout(() => this.searchInputs[[preset.tag]].select())
            }
          },
          render: (text) => {
            if (typeof text === 'string') {
              return (
                <Highlighter
                  highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                  searchWords={[this.state.searchText]}
                  autoEscape
                  textToHighlight={text}
                />
              )
            } else {
              return (<span>{text}</span>)
            }
          }
        })
      })
    } else {
      console.warn('table missing presets, using defaults')
      Object.keys(firstRow).forEach((key) => {
        columns.push({
          dataIndex: key,
          title: key,
          width: 150,
          editable: false // not safe to edit if presets are not configured
        })
      })
    }
    if (!setDynamicSizedColumn) {
      // make the last column dynamic by removing set width
      const lastCol = columns[columns.length - 1]
      delete lastCol.width
    }
    return columns
  }

  onDataChange = async (rowToUpdate: Object) => {
    const { dataEditorState, mapState } = this.props.containers
    const mapComponent = mapState.state.map
    console.log('data changed')
    console.log(rowToUpdate)
    const mhid = rowToUpdate[this.state.rowKey]
    const featureData = await dataEditorState.selectFeature(mhid)
    // update data
    const data = featureData.properties
    Object.assign(data, rowToUpdate)
    const edit = await dataEditorState.updateSelectedFeatureTags(data)
    mapComponent.onFeatureUpdate(edit.status, edit)
  }

  onStartEditing = async () => {
    const { containers, layer } = this.props
    const { dataEditorState } = containers
    await dataEditorState.startEditing(layer)
    this.setState({editing: true})
  }

  onCancel = () => {
    const { containers, t } = this.props
    const { dataEditorState } = containers
    if (dataEditorState.state.edits?.length > 0) {
      confirm({
        title: t('Stop Editing'),
        content: t('Any pending changes will be lost'),
        okText: t('Stop Editing'),
        okType: 'danger',
        onOk: async () => {
          await dataEditorState.stopEditing()
          this.setState({editing: false})
        }
      })
    } else {
      this.setState({editing: false})
    }
  }

  onSave = () => {
    const { containers, _csrf, t } = this.props
    const { dataEditorState } = containers
    const sourceID = Object.keys(dataEditorState.state.editingLayer.style.sources)[0]
    dataEditorState.saveEdits(_csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        this.setState({editing: false})
        dataEditorState.stopEditing()
        message.success(t('Data Saved'), 1, () => {
          // location.reload()
          this.reloadEditingSourceCache(sourceID)
        })
      }
    })
  }

  reloadEditingSourceCache (sourceID: string) {
    const {mapState} = this.props.containers
    const mapComponent = mapState.state.map
    const sourceCache = mapComponent.map.style.sourceCaches[sourceID]

    if (sourceCache) {
      // From: https://github.com/mapbox/mapbox-gl-js/issues/2941#issuecomment-518631078
      // Remove the tiles for a particular source
      sourceCache.clearTiles()

      // Load the new tiles for the current viewport (map.transform -> viewport)
      sourceCache.update(mapComponent.map.transform)

      // Force a repaint, so that the map will be repainted without you having to touch the map
      mapComponent.map.triggerRepaint()
      // mapComponent.reloadStyle()
    }
  }

  onUndo = () => {
    const { dataEditorState, mapState } = this.props.containers
    const mapComponent = mapState.state.map
    dataEditorState.undoEdit((type, edit) => {
      const rowToUndo = edit.geojson.properties
      console.log('undo')
      console.log(rowToUndo)
      this.tableRef.handleSave(rowToUndo, true)
      mapComponent.onFeatureUpdate(type, edit)
    })
  }

  onRedo = () => {
    const { dataEditorState, mapState } = this.props.containers
    const mapComponent = mapState.state.map
    dataEditorState.redoEdit((type, edit) => {
      const rowToRedo = edit.geojson.properties
      console.log('undo')
      console.log(rowToRedo)
      this.tableRef.handleSave(rowToRedo, true)
      mapComponent.onFeatureUpdate(type, edit)
    })
  }

  onViewSelectedFeature = () => {
    const { layer, presets } = this.props
    const { selectedFeature, rowKey } = this.state
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
    window.location = url
  }

  onClearSelection = () => {
    this.setState({selectedFeature: undefined, selectedRowKeys: []})
  }

  render () {
    const {layer, containers, canEdit, t} = this.props
    const { editing, columns, rows, rowKey, selectedFeature } = this.state
    const { dataEditorState } = containers

    const name = slugify(t(layer.name))
    const layerId = layer.layer_id
    const csvURL = `/api/layer/${layerId}/export/csv/${name}.csv`

    const rowSelection = {
      type: 'radio',
      // selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        const { rowKey } = this.state
        const { geoJSON, containers } = this.props
        const {mapState} = containers
        const selected = selectedRows[0]
        const idVal = selected[rowKey]

        this.setState({selectedFeature: selected, selectedRowKeys})
        if (geoJSON) {
          geoJSON.features.forEach((feature) => {
            if (idVal === feature.properties[rowKey]) {
              const bbox = turf_bbox(feature)
              mapState.state.map.fitBounds(bbox, 16, 25)
            }
          })
        } else {
          console.log('GeoJSON not found, unable to update the map')
        }
      },
      getCheckboxProps: record => ({
        name: record[this.state.rowKey]
      })
    }

    return (
      <Row>
        <Row justify='end' align='middle' style={{height: '50px', padding: '0px 10px'}}>
          {(!editing && selectedFeature) &&
            <>
              <Button style={{marginRight: '10px'}} onClick={this.onClearSelection}>
                {t('Clear Selection')}
              </Button>
              <Button style={{marginRight: '10px'}} onClick={this.onViewSelectedFeature}>
                {t('View Selected')}
              </Button>
            </>}
          {(!editing && !layer.disable_export) && <Button href={csvURL} style={{marginRight: '10px'}} icon={<DownloadOutlined />}>{t('Download CSV')}</Button>}
          {(!editing && canEdit) && <Button onClick={this.onStartEditing}>{t('Edit')}</Button>}
          {editing &&
            <>
              <Button onClick={this.onUndo} disabled={dataEditorState.state?.edits.length === 0} style={{marginRight: '10px'}} icon={<UndoOutlined />}>{t('Undo')}</Button>
              <Button onClick={this.onRedo} disabled={dataEditorState.state?.redo.length === 0} style={{marginRight: '10px'}} icon={<RedoOutlined />}>{t('Redo')}</Button>
              <Button onClick={this.onSave} disabled={dataEditorState.state?.edits.length === 0} type='primary' style={{marginRight: '10px'}} icon={<SaveOutlined />}>{t('Save')}</Button>
              <Button onClick={this.onCancel} danger>{t('Cancel')}</Button>
            </>}
        </Row>
        <Row style={{height: 'calc(100% - 50px)'}}>
          <EditableTable
            ref={el => { this.tableRef = el }}
            columns={columns}
            rowKey={rowKey}
            dataSource={rows}
            editing={editing}
            onChange={this.onDataChange}
            rowSelection={rowSelection}
          />
        </Row>
      </Row>
    )
  }
}
export default (subscribe(DataGrid, {
  dataEditorState: DataEditorContainer,
  mapState: MapContainer
}): any)
