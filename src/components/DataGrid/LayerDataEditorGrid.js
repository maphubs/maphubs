//@flow
import React from 'react';
import _map from 'lodash.map';
import MapHubsComponent from '../MapHubsComponent';
import CheckboxFormatter from './CheckboxFormatter';
import update from 'immutability-helper';
import type {MapHubsField} from '../../types/maphubs-field';
import DataEditorStore from '../../stores/DataEditorStore';
import DataEditorActions from '../../actions/DataEditorActions';
import _assignIn from 'lodash.assignin';
import type {Layer} from '../../stores/layer-store';
import type {DataEditorStoreState} from '../../stores/DataEditorStore';
import GetNameField from '../../services/get-name-field';

type Props = {
  geoJSON: Object,
  presets: Object,
  gridHeight: number,
  onRowSelected: Function,
  layer: Layer,

  dataLoadingMsg: string,
  onSave?: Function,
  presets: Array<MapHubsField>
}

type DefaultProps = {
  dataLoadingMsg: string
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
  gridHeight: number,
  gridWidth: number,
  gridHeightOffset: number,
  rows: Array<Object>,
  selectedIndexes: Array<number>,
  columns: Array<Column>,
  filters: Object,
  rowKey?: string,
  sortColumn?: string,
  sortDirection?: string,
  selectedFeature?: Object
} & DataEditorStoreState

export default class LayerDataEditorGrid extends MapHubsComponent<Props, State> {

  Selectors: null
  ReactDataGrid: any
  Toolbar: any
  DropDownEditor: any
  CheckboxEditor: any
  DropDownFormatter: any

  props: Props

  static defaultProps: DefaultProps = {
    dataLoadingMsg: 'Data Loading'
  }

  state: State = {
    gridHeight: 100,
    gridWidth: 100,
    gridHeightOffset: 48,
    rows: [],
    selectedIndexes: [],
    columns: [],
    filters: {},
    edits: [],
    originals: [],
    redo: []
  }

  constructor(props: Props){
    super(props);
    this.stores.push(DataEditorStore);
  }

  componentWillMount(){
    if(typeof window !== 'undefined'){
      this.initReactDataGrid();
    }
  }

  componentDidMount(){
    if(this.props.geoJSON){
      this.processGeoJSON(this.props.geoJSON, this.props.presets);
      DataEditorActions.startEditing(this.props.layer);
    }
  }

  componentWillReceiveProps(nextProps: Props){
    if(nextProps.geoJSON && !this.state.geoJSON){
      this.processGeoJSON(nextProps.geoJSON, nextProps.presets);
    }
    if(nextProps.gridHeight && nextProps.gridHeight !== this.state.gridHeight){
      this.setState({gridHeight: nextProps.gridHeight});
    }
  }

  initReactDataGrid = () => {
      this.ReactDataGrid = require('react-data-grid');
      const {Toolbar, Editors, Formatters, Data: {Selectors}} = require('react-data-grid-addons');
      this.Toolbar = Toolbar;
      this.Selectors = Selectors;
      const {DropDownEditor, CheckboxEditor} = Editors;
      this.DropDownEditor = DropDownEditor;
      this.CheckboxEditor = CheckboxEditor;
      const {DropDownFormatter} = Formatters;   
      this.DropDownFormatter = DropDownFormatter;
  }

  processGeoJSON = (geoJSON: Object, presets:any=null) => {
    var _this = this;
    //clone feature to avoid data grid attaching other values
    var features = JSON.parse(JSON.stringify(geoJSON.features));

    var originalRows = _map(features, 'properties');

    var firstRow = originalRows[0];

    var rowKey = 'mhid';
    if(firstRow.mhid){
      rowKey = 'mhid';
    }
    else if(firstRow.objectid){
      rowKey = 'objectid';

    } else if(firstRow.OBJECTID){
      rowKey = 'OBJECTID';
    }

    var columns: Array<Column> = [];
    columns.push(
      {
        key: rowKey,
        name: 'ID',
        width : 120,
        resizable: true,
        sortable : true,
        filterable: true
      }
    );
    if(presets){
        presets.forEach((preset) => {
        if(preset.type === 'check'){
          let CheckboxEditor = this.CheckboxEditor;
          columns.push(
            {
              key: preset.tag,
              name: _this._o_(preset.label),
              width : 120,
              resizable: true,
              sortable : true,
              filterable: true,
              editor: <CheckboxEditor />,
              formatter: CheckboxFormatter
            }
          );
          
        }else if(preset.type === 'combo' || preset.type === 'radio'){
          let options = preset.options.split(',').map(option => {
            return option.trim();
          });
          let DropDownEditor = this.DropDownEditor;
          let DropDownFormatter = this.DropDownFormatter;
          columns.push(
            {
              key: preset.tag,
              name: _this._o_(preset.label),
              width : 120,
              resizable: true,
              sortable : true,
              filterable: true,
              editor: <DropDownEditor options={options}/>,
              formatter: <DropDownFormatter options={options}/>
            }
          );
          
        }else if(preset.type === 'number'){
          columns.push(
            {
              key: preset.tag,
              name: _this._o_(preset.label),
              width : 120,
              resizable: true,
              sortable : true,
              filterable: true,
              editable: true
            }
          );
          
        }else{
           columns.push(
            {
              key: preset.tag,
              name: _this._o_(preset.label),
              width : 120,
              resizable: true,
              sortable : true,
              filterable: true,
              editable: true
            }
          );
        }
       
      });
    }else{
      Object.keys(firstRow).forEach((key) => {
        columns.push(
          {
            key,
            name: key,
            width : 120,
            resizable: true,
            sortable : true,
            filterable: true
          }
        );
      });
    }

    var rows = originalRows.slice(0);

    _this.setState({geoJSON, columns, rowKey, rows, filters : {}});
  }

  handleGridSort = (sortColumn: string, sortDirection: string) => {
    this.setState({sortColumn, sortDirection});
  }

  getRows = (): Array<Object> => {
    if(this.Selectors){
      return this.Selectors.getRows(this.state);
    }else{
      return [];
    }
  }

  getSize = (): number => {
    return this.getRows().length;
  }


  rowGetter = (rowIdx: number): Object => {
    let rows = this.getRows();
    return rows[rowIdx];
  }

  handleFilterChange = (filter: Object) => {
    let newFilters = Object.assign({}, this.state.filters);
    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter;
    } else {
      delete newFilters[filter.column.key];
    }
    this.setState({filters: newFilters});
  }

  onClearFilters = () => {
    // all filters removed
    this.setState({filters: {}});
  }

  onRowsSelected = (rows: Array<Object>) => {
    if(!rows || rows.length === 0){
      return;
    }
    var row = rows[0];
    var idField = this.state.rowKey;
    var idVal = row.row[idField];

    this.props.onRowSelected(idVal,idField);
    this.setState({selectedIndexes: this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))});
  }

  onRowsDeselected = (rows: Array<Object>) => {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({selectedIndexes: this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1 )});
  }

  getSelectedFeature(){
    const row = this.rowGetter(this.state.selectedIndexes[this.state.selectedIndexes.length - 1]);
    const idField = this.state.rowKey;
    var idVal = row[idField];
    let selectedFeature;
    if(this.state.geoJSON) {
      this.state.geoJSON.features.forEach((feature)=>{
      if(feature.properties[idField] &&
        feature.properties[idField] === idVal){
          selectedFeature = feature;
        }
      });
    }
    return selectedFeature;
  }

  onViewSelectedFeature = () => {
    if(!this.state.selectedIndexes || this.state.selectedIndexes.length === 0){
      return;
    }
    const lastSelectedIndex: number = this.state.selectedIndexes[this.state.selectedIndexes.length - 1];    
    var row = this.rowGetter(lastSelectedIndex);
    var idField = this.state.rowKey;
    var idVal = row[idField];

    let featureName = 'unknown';
    let nameField = GetNameField.getNameField(row, this.props.presets);
    if(nameField){
      featureName = row[nameField];
    } 
    if(this.state.rowKey === 'mhid'){
      idVal = idVal.split(':')[1];
    }
    let layer_id = this.props.layer.layer_id ? this.props.layer.layer_id : 0;
    let url = `/feature/${layer_id}/${idVal}/${featureName}`;
    window.location = url;
  }


   handleGridRowsUpdated = (result: Object) => {
     let fromRow: number = result.fromRow;
     let toRow: number = result.toRow;
     let updated: Object = result.updated;
     let rows = this.getRows().slice();

    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = this.rowGetter(i);
      let mhid = rowToUpdate[this.state.rowKey];
      DataEditorActions.selectFeature(mhid, (featureData) => {
        //update data
        let data = featureData.properties;
        _assignIn(data, updated);
        DataEditorActions.updateSelectedFeatureTags(data);
      });
      let updatedRow = update(rowToUpdate, {$merge: updated});
      rows[i] = updatedRow;
    }

    this.setState({rows});
  }


render() {
  var _this = this;

   if(this.state.rows.length > 0 && typeof window !== 'undefined'){
    let ReactDataGrid = this.ReactDataGrid;
    let Toolbar = this.Toolbar;
  return (
    <ReactDataGrid
           ref="grid"
           columns={this.state.columns}
           rowKey={this.state.rowKey}
            rowGetter={this.rowGetter}
            rowsCount={this.getSize()}
            minHeight={this.state.gridHeight}
            onGridSort={this.handleGridSort}
            onRowSelect={this.onRowSelect}
            enableCellSelect={true}
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
            toolbar={<Toolbar
              enableFilter={true}
              filterRowsButtonText={this.__('Filter Data')}
              >
              <button type="button" style={{marginLeft: '5px'}} className="btn" onClick={_this.onViewSelectedFeature}>
                {this.__('View Selected')}
              </button>
              </Toolbar>
            }
            onAddFilter={this.handleFilterChange}
            onClearFilters={this.onClearFilters}
            />
    );
  }else{
    return(
      <div><h5>{this.__(this.props.dataLoadingMsg)}</h5></div>
    );
    
  }
}
}