// @flow
import React from 'react'
import { Button } from 'antd'
import _map from 'lodash.map'
import MapHubsComponent from '../MapHubsComponent'
import EditAttributesModal from './EditAttributesModal'
import CheckboxFormatter from './CheckboxFormatter'
import _assignIn from 'lodash.assignin'
import type {MapHubsField} from '../../types/maphubs-field'
import GetNameField from '../Map/Styles/get-name-field'
import turf_bbox from '@turf/bbox'
import MapContainer from '../Map/containers/MapContainer'
import { subscribe } from '../Map/containers/unstated-props'

type Props = {
  geoJSON: Object,
  presets: Object,
  height: number,
  onRowSelected: Function,
  layer_id: number,
  dataLoadingMsg: string,
  canEdit: boolean,
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
  geoJSON: ?Object,
  rows: Array<Object>,
  selectedIndexes: Array<number>,
  columns: Array<Column>,
  filters: Object,
  rowKey: ?string,
  sortColumn: ?string,
  sortDirection: ?string,
  selectedFeature?: Object
}

class LayerDataGrid extends MapHubsComponent<Props, State> {
  Selectors: null

  static defaultProps = {
    dataLoadingMsg: 'Data Loading',
    height: 200
  }

  state: State = {
    geoJSON: null,
    rows: [],
    selectedIndexes: [],
    columns: [],
    filters: {},
    rowKey: null,
    sortColumn: null,
    sortDirection: null
  }

  componentDidMount () {
    if (this.props.geoJSON) {
      this.processGeoJSON(this.props.geoJSON, this.props.presets)
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (nextProps.geoJSON && !this.state.geoJSON) {
      this.processGeoJSON(nextProps.geoJSON, nextProps.presets)
    }
  }

  processGeoJSON = (geoJSON: Object, presets:any = null) => {
    const _this = this

    if (!geoJSON.features || geoJSON.features.length === 0) {
      return
    }
    // clone feature to avoid data grid attaching other values
    const features = JSON.parse(JSON.stringify(geoJSON.features))

    const originalRows = _map(features, 'properties')

    const firstRow = originalRows[0]

    let rowKey = 'mhid'
    if (!firstRow || firstRow.mhid) {
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
          columns.push(
            {
              key: preset.tag,
              name: _this.t(preset.label),
              width: 120,
              formatter: CheckboxFormatter,
              resizable: true,
              sortable: true,
              filterable: true
            })
        } else {
          columns.push(
            {
              key: preset.tag,
              name: _this.t(preset.label),
              width: 120,
              resizable: true,
              sortable: true,
              filterable: true
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
      const {mapState} = this.props.containers
      this.state.geoJSON.features.forEach((feature) => {
        if (idVal === feature.properties[idField]) {
          const bbox = turf_bbox(feature)
          mapState.state.map.fitBounds(bbox, 16, 25)
        }
      })
    }
    this.setState({selectedIndexes: this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))})
  }

  onRowsDeselected = (rows: Array<Object>) => {
    const rowIndexes = rows.map(r => r.rowIdx)
    this.setState({selectedIndexes: this.state.selectedIndexes.filter(i => !rowIndexes.includes(i))})
  }

  onEditSelectedFeature = () => {
    this.setState({selectedFeature: this.getSelectedFeature()})
    this.refs.editAttributeModal.show()
  }

  onSaveEdits = (data: Object) => {
    // find row with this MHID and update it
    const idField = this.state.rowKey
    this.getRows().forEach((row) => {
      if (row[idField] === data[idField]) {
        _assignIn(row, data)
      }
    })

    if (this.props.onSave) {
      this.props.onSave(data)
    }
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
    const row = this.state.rows[this.state.selectedIndexes[this.state.selectedIndexes.length - 1]]
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
    const url = '/feature/' + this.props.layer_id.toString() + '/' + idVal + '/' + featureName
    window.location = url
  }

  render () {
    const {t} = this
    const _this = this
    const {canEdit, presets, layer_id, height} = this.props
    if (this.state.rows.length > 0 && typeof window !== 'undefined') {
      const ReactDataGrid = require('react-data-grid')
      const {Toolbar, Data: {Selectors}} = require('react-data-grid-addons')
      this.Selectors = Selectors

      return (
        <ReactDataGrid
          ref='grid'
          columns={this.state.columns}
          rowKey={this.state.rowKey}
          rowGetter={this.rowGetter}
          rowsCount={this.getSize()}
          minHeight={height - 49}
          onGridSort={this.handleGridSort}
          rowSelection={{
            showCheckbox: true,
            enableShiftSelect: false,
            onRowsSelected: this.onRowsSelected,
            onRowsDeselected: this.onRowsDeselected,
            selectBy: {
              indexes: this.state.selectedIndexes
            }
          }}
          toolbar={<Toolbar
            enableFilter
            filterRowsButtonText={t('Filter Data')}
          >
            {canEdit &&
              <Button type='primary' style={{marginLeft: '5px'}} onClick={this.onEditSelectedFeature}>
                {t('Edit Selected')}
              </Button>}
            <Button type='primary' style={{marginLeft: '5px'}} onClick={_this.onViewSelectedFeature}>
              {t('View Selected')}
            </Button>
            {(canEdit && presets) &&
              <EditAttributesModal
                ref='editAttributeModal'
                feature={this.state.selectedFeature}
                presets={presets}
                onSave={this.onSaveEdits}
                _csrf={this.state._csrf}
                t={t}
                layer_id={layer_id}
              />}
          </Toolbar>}
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

export default subscribe(LayerDataGrid, {
  mapState: MapContainer
})
