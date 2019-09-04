// @flow
import React from 'react'
import _map from 'lodash.map'
import MapHubsComponent from '../MapHubsComponent'
import CheckboxFormatter from './CheckboxFormatter'
import update from 'immutability-helper'
import type {MapHubsField} from '../../types/maphubs-field'
import connect from 'unstated-connect'
import DataEditorContainer from '../Map/containers/DataEditorContainer'
import MapContainer from '../Map/containers/MapContainer'
import _assignIn from 'lodash.assignin'
import type {Layer} from '../../types/layer'
import GetNameField from '../Map/Styles/get-name-field'
import turf_bbox from '@turf/bbox'

type Props = {
  geoJSON: Object,
  presets: Object,
  height: number,
  layer: Layer,

  dataLoadingMsg: string,
  onSave?: Function,
  presets: Array<MapHubsField>,
  containers: Array<Object>
}

type Column = {
  key: string,
  name: string,
  width : number,
  resizable: boolean,
  sortable : boolean,
  filterable: boolean
}

type State = {
  geoJSON?: Object,
  rows: Array<Object>,
  selectedIndexes: Array<number>,
  columns: Array<Column>,
  filters: Object,
  rowKey?: string,
  sortColumn?: string,
  sortDirection?: string,
  selectedFeature?: Object
}

class LayerDataEditorGrid extends MapHubsComponent<Props, State> {
  Selectors: null

  ReactDataGrid: any

  Toolbar: any

  DropDownEditor: any

  CheckboxEditor: any

  DropDownFormatter: any

  static defaultProps = {
    dataLoadingMsg: 'Data Loading',
    height: 300
  }

  state: State = {
    rows: [],
    selectedIndexes: [],
    columns: [],
    filters: {},
    edits: [],
    originals: [],
    redo: []
  }

  componentWillMount () {
    if (typeof window !== 'undefined') {
      this.initReactDataGrid()
    }
  }

  componentDidMount () {
    if (this.props.geoJSON) {
      const [DataEditorState] = this.props.containers
      this.processGeoJSON(this.props.geoJSON, this.props.presets)
      DataEditorState.startEditing(this.props.layer)
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (nextProps.geoJSON && !this.state.geoJSON) {
      this.processGeoJSON(nextProps.geoJSON, nextProps.presets)
    }
  }

  initReactDataGrid = () => {
    this.ReactDataGrid = require('react-data-grid')
    const {Toolbar, Editors, Formatters, Data: {Selectors}} = require('react-data-grid-addons')
    this.Toolbar = Toolbar
    this.Selectors = Selectors
    const {DropDownEditor, CheckboxEditor} = Editors
    this.DropDownEditor = DropDownEditor
    this.CheckboxEditor = CheckboxEditor
    const {DropDownFormatter} = Formatters
    this.DropDownFormatter = DropDownFormatter
  }

  processGeoJSON = (geoJSON: Object, presets:any = null) => {
    const _this = this
    // clone feature to avoid data grid attaching other values
    const features = JSON.parse(JSON.stringify(geoJSON.features))

    const originalRows = _map(features, 'properties')

    const firstRow = originalRows[0]

    let rowKey = 'mhid'
    if (firstRow.mhid) {
      rowKey = 'mhid'
    } else if (firstRow.objectid) {
      rowKey = 'objectid'
    } else if (firstRow.OBJECTID) {
      rowKey = 'OBJECTID'
    }

    const columns: Array<Column> = []
    columns.push(
      {
        key: rowKey,
        name: 'ID',
        width: 120,
        resizable: true,
        sortable: true,
        filterable: true
      }
    )
    if (presets) {
      presets.forEach((preset) => {
        if (preset.type === 'check') {
          const CheckboxEditor = this.CheckboxEditor
          columns.push(
            {
              key: preset.tag,
              name: _this.t(preset.label),
              width: 120,
              resizable: true,
              sortable: true,
              filterable: true,
              editor: <CheckboxEditor />,
              formatter: CheckboxFormatter
            }
          )
        } else if (preset.type === 'combo' || preset.type === 'radio') {
          const options = preset.options.split(',').map(option => {
            return option.trim()
          })
          const DropDownEditor = this.DropDownEditor
          const DropDownFormatter = this.DropDownFormatter
          columns.push(
            {
              key: preset.tag,
              name: _this.t(preset.label),
              width: 120,
              resizable: true,
              sortable: true,
              filterable: true,
              editor: <DropDownEditor options={options} />,
              formatter: <DropDownFormatter options={options} />
            }
          )
        } else if (preset.type === 'number') {
          columns.push(
            {
              key: preset.tag,
              name: _this.t(preset.label),
              width: 120,
              resizable: true,
              sortable: true,
              filterable: true,
              editable: true
            }
          )
        } else {
          columns.push(
            {
              key: preset.tag,
              name: _this.t(preset.label),
              width: 120,
              resizable: true,
              sortable: true,
              filterable: true,
              editable: true
            }
          )
        }
      })
    } else {
      Object.keys(firstRow).forEach((key) => {
        columns.push(
          {
            key,
            name: key,
            width: 120,
            resizable: true,
            sortable: true,
            filterable: true
          }
        )
      })
    }

    const rows = originalRows.slice(0)

    _this.setState({geoJSON, columns, rowKey, rows, filters: {}})
  }

  handleGridSort = (sortColumn: string, sortDirection: string) => {
    this.setState({sortColumn, sortDirection})
  }

  getRows = (): Array<Object> => {
    if (this.Selectors) {
      return this.Selectors.getRows(this.state)
    } else {
      return []
    }
  }

  getSize = (): number => {
    return this.getRows().length
  }

  rowGetter = (rowIdx: number): Object => {
    const rows = this.getRows()
    return rows[rowIdx]
  }

  handleFilterChange = (filter: Object) => {
    const newFilters = Object.assign({}, this.state.filters)
    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter
    } else {
      delete newFilters[filter.column.key]
    }
    this.setState({filters: newFilters})
  }

  onClearFilters = () => {
    // all filters removed
    this.setState({filters: {}})
  }

  onRowsSelected = (rows: Array<Object>) => {
    if (!rows || rows.length === 0) {
      return
    }
    const row = rows[0]
    const idField = this.state.rowKey
    const idVal = row.row[idField]

    if (this.state.geoJSON) {
      const [, MapState] = this.props.containers
      this.state.geoJSON.features.forEach((feature) => {
        if (idVal === feature.properties[idField]) {
          const bbox = turf_bbox(feature)
          MapState.state.map.fitBounds(bbox, 16, 25)
        }
      })
    }
    this.setState({selectedIndexes: this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))})
  }

  onRowsDeselected = (rows: Array<Object>) => {
    const rowIndexes = rows.map(r => r.rowIdx)
    this.setState({selectedIndexes: this.state.selectedIndexes.filter(i => !rowIndexes.includes(i))})
  }

  getSelectedFeature () {
    const row = this.rowGetter(this.state.selectedIndexes[this.state.selectedIndexes.length - 1])
    const idField = this.state.rowKey
    const idVal = row[idField]
    let selectedFeature
    if (this.state.geoJSON) {
      this.state.geoJSON.features.forEach((feature) => {
        if (feature.properties[idField] &&
        feature.properties[idField] === idVal) {
          selectedFeature = feature
        }
      })
    }
    return selectedFeature
  }

  onViewSelectedFeature = () => {
    if (!this.state.selectedIndexes || this.state.selectedIndexes.length === 0) {
      return
    }
    const lastSelectedIndex: number = this.state.selectedIndexes[this.state.selectedIndexes.length - 1]
    const row = this.rowGetter(lastSelectedIndex)
    const idField = this.state.rowKey
    let idVal = row[idField]

    let featureName = 'unknown'
    const nameField = GetNameField.getNameField(row, this.props.presets)
    if (nameField) {
      featureName = row[nameField]
    }
    if (this.state.rowKey === 'mhid') {
      idVal = idVal.split(':')[1]
    }
    const layer_id = this.props.layer.layer_id ? this.props.layer.layer_id : 0
    const url = `/feature/${layer_id}/${idVal}/${featureName}`
    window.location = url
  }

  handleGridRowsUpdated = (result: Object) => {
    const fromRow: number = result.fromRow
    const toRow: number = result.toRow
    const updated: Object = result.updated
    const rows = this.getRows().slice()
    const [DataEditorState] = this.props.containers

    for (let i = fromRow; i <= toRow; i++) {
      const rowToUpdate = this.rowGetter(i)
      const mhid = rowToUpdate[this.state.rowKey]
      DataEditorState.selectFeature(mhid, (featureData) => {
        // update data
        const data = featureData.properties
        _assignIn(data, updated)
        DataEditorState.updateSelectedFeatureTags(data)
      })
      const updatedRow = update(rowToUpdate, {$merge: updated})
      rows[i] = updatedRow
    }

    this.setState({rows})
  }

  render () {
    const {t} = this
    const { height } = this.props
    const _this = this

    if (this.state.rows.length > 0 && typeof window !== 'undefined') {
      const ReactDataGrid = this.ReactDataGrid
      const Toolbar = this.Toolbar
      return (
        <ReactDataGrid
          ref='grid'
          columns={this.state.columns}
          rowKey={this.state.rowKey}
          rowGetter={this.rowGetter}
          rowsCount={this.getSize()}
          minHeight={height - 49}
          onGridSort={this.handleGridSort}
          onRowSelect={this.onRowSelect}
          enableCellSelect
          onGridRowsUpdated={this.handleGridRowsUpdated}
          rowSelection={{
            showCheckbox: true,
            enableShiftSelect: false,
            onRowsSelected: this.onRowsSelected,
            onRowsDeselected: this.onRowsDeselected,
            selectBy: {
              indexes: this.state.selectedIndexes
            }
          }}
          toolbar={
            <Toolbar
              enableFilter
              filterRowsButtonText={t('Filter Data')}
            >
              <button type='button' style={{marginLeft: '5px'}} className='btn' onClick={_this.onViewSelectedFeature}>
                {t('View Selected')}
              </button>
            </Toolbar>
          }
          onAddFilter={this.handleFilterChange}
          onClearFilters={this.onClearFilters}
        />
      )
    } else {
      return (
        <div><h5>{t(this.props.dataLoadingMsg)}</h5></div>
      )
    }
  }
}

export default connect([DataEditorContainer, MapContainer])(LayerDataEditorGrid)
