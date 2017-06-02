//@flow
import React from 'react';
import _map from 'lodash.map';
import MapHubsComponent from '../MapHubsComponent';
import EditAttributesModal from './EditAttributesModal';
import CheckboxFormatter from './CheckboxFormatter';

type Props = {
  geoJSON: Object,
  presets: Object,
  gridHeight: number,
  onRowSelected: Function,
  layer_id: number,
  dataLoadingMsg: string,
  canEdit: boolean,
  onSave: Function
}

type State = {
  geoJSON: ?Object,
  gridHeight: number,
  gridWidth: number,
  gridHeightOffset: number,
  rows: Array<Object>,
  selectedIndexes: Array<number>,
  columns: Array<string>,
  filters: Object,
  rowKey: ?string,
  sortColumn: ?string,
  sortDirection: ?string,
  selectedFeature?: Object
}

export default class LayerDataGrid extends MapHubsComponent<void, Props, State> {

  Selectors: null

  props: Props

  static defaultProps = {
    dataLoadingMsg: 'Data Loading'
  }

  state: State = {
    geoJSON: null,
    gridHeight: 100,
    gridWidth: 100,
    gridHeightOffset: 48,
    rows: [],
    selectedIndexes: [],
    columns: [],
    filters: {},
    rowKey: null,
    sortColumn: null,
    sortDirection: null
  }

  componentDidMount(){
    if(this.props.geoJSON){
      this.processGeoJSON(this.props.geoJSON, this.props.presets);
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

    var columns = [];
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
           columns.push(
          {
            key: preset.key,
            name: preset.label,
            width : 120,
            formatter: CheckboxFormatter,
            resizable: true,
            sortable : true,
            filterable: true
          });
        }else{
           columns.push(
          {
            key: preset.key,
            name: preset.label,
            width : 120,
            resizable: true,
            sortable : true,
            filterable: true
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

  onEditSelectedFeature = () => {
    this.setState({selectedFeature: this.getSelectedFeature()});
    this.refs.editAttributeModal.show();
  }

  getSelectedFeature(){
    const row = this.state.rows[this.state.selectedIndexes[this.state.selectedIndexes.length - 1]];
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
    var row = this.state.rows[this.state.selectedIndexes[this.state.selectedIndexes.length - 1]];
    var idField = this.state.rowKey;
    var idVal = row[idField];

    var featureName = 'unknown';
    var nameFields = ['name', 'Name', 'NAME', 'nom', 'Nom', 'NOM', 'nombre', 'Nombre', 'NOMBRE'];
    nameFields.forEach((name) => {
      if(featureName === 'unknown' && row[name]){
        featureName = row[name];
      }
    });
    if(this.state.rowKey === 'mhid'){
      idVal = idVal.split(':')[1];
    }
    var url = '/feature/' + this.props.layer_id.toString() + '/' + idVal + '/' + featureName;
    window.location = url;
  }


render() {
  var _this = this;

   if(this.state.rows.length > 0 && typeof window !== 'undefined'){
      var ReactDataGrid = require('react-data-grid');
      const {Toolbar, Data: {Selectors}} = require('react-data-grid-addons');
      this.Selectors = Selectors;

      let editButton = '', editModal;
      if(this.props.canEdit){
        editButton = (
          <a style={{marginLeft: '5px', padding: '0px'}} 
          className="btn btn-floating" 
          onClick={_this.onEditSelectedFeature}>
            <i className="material-icons omh-accent-text">edit</i>
          </a>
        );

        if(this.props.presets){
          editModal = (
            <EditAttributesModal 
                ref="editAttributeModal"
                feature={this.state.selectedFeature}
                presets={this.props.presets}
                onSave={this.props.onSave}
                layer_id={this.props.layer_id} />
          );
        }

      }

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
              {editButton}
              <a 
                style={{marginLeft: '5px', padding: '0px'}} 
                className="btn btn-floating" 
                onClick={_this.onViewSelectedFeature}>
                <i className="material-icons omh-accent-text">info</i>
              </a>
              {editModal}
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