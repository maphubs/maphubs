//@flow
const React = require('react');
import PropTypes from 'prop-types';
var _map = require('lodash.map');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var LocaleMixin = require('../LocaleMixin');

const LayerDataGrid = React.createClass({

  mixins:[LocaleMixin, PureRenderMixin, StateMixin.connect(LocaleStore)],

  Selectors: null,

  propTypes: {
    geoJSON: PropTypes.object,
    presets: PropTypes.object,
    gridHeight: PropTypes.number,
    onRowSelected: PropTypes.func.isRequired,
    layer_id: PropTypes.number.isRequired,
  },

  getInitialState(){
    return {
      geoJSON: undefined,
      dataMsg: '',
      gridHeight: 100,
      gridWidth: 100,
      gridHeightOffset: 48,
      editingNotes: false,
      rows: [],
      selectedIndexes: [],
      columns: [],
      filters: {},
      rowKey: undefined,
      sortColumn: undefined,
      sortDirection: undefined
    };
  },

  componentDidMount(){
    if(this.props.geoJSON){
      this.processGeoJSON(this.props.geoJSON, this.props.presets);
    }
  },

  componentWillReceiveProps(nextProps: Object){
    if(nextProps.geoJSON && !this.state.geoJSON){
      this.processGeoJSON(nextProps.geoJSON, nextProps.presets);
    }
    if(nextProps.gridHeight && nextProps.gridHeight !== this.state.gridHeight){
      this.setState({gridHeight: nextProps.gridHeight});
    }
  },

  processGeoJSON(geoJSON: Object, presets:any=null){
    var _this = this;
    var originalRows = _map(geoJSON.features, 'properties');

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
      Object.keys(presets.fields).forEach(function(fieldsKey){
        var field = presets.fields[fieldsKey];

        columns.push(
          {
            key: field.key,
            name: field.label,
            width : 120,
            resizable: true,
            sortable : true,
            filterable: true
          }
        );
      });
    }else{
      Object.keys(firstRow).forEach(function(key){
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
  },

   handleGridSort(sortColumn: string, sortDirection: string) {
    this.setState({sortColumn, sortDirection});
  },

  getRows(): Array<Object> {
    if(this.Selectors){
      return this.Selectors.getRows(this.state);
    }else{
      return [];
    }
  },

  getSize(): number {
    return this.getRows().length;
  },

  rowGetter(rowIdx: number): Object {
    let rows = this.getRows();
    return rows[rowIdx];
  },

  handleFilterChange(filter: Object) {
    let newFilters = Object.assign({}, this.state.filters);
    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter;
    } else {
      delete newFilters[filter.column.key];
    }
    this.setState({ filters: newFilters });
  },

  onClearFilters() {
    // all filters removed
    this.setState({filters: {}});
  },

  onRowsSelected(rows: Array<Object>) {
    if(!rows || rows.length == 0){
      return;
    }
    var row = rows[0];
    var idField = this.state.rowKey;
    var idVal = row.row[idField];

    this.props.onRowSelected(idVal,idField);
    this.setState({selectedIndexes: this.state.selectedIndexes.concat(rows.map(r => r.rowIdx))});
  },

  onRowsDeselected(rows: Array<Object>) {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({selectedIndexes: this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1 )});
  },

  onViewSelectedFeature(){
    if(!this.state.selectedIndexes || this.state.selectedIndexes.length == 0){
      return;
    }
    var row = this.state.rows[this.state.selectedIndexes[0]];
    var idField = this.state.rowKey;
    var idVal = row[idField];

    var featureName = 'unknown';
    var nameFields = ['name', 'Name', 'NAME', 'nom', 'Nom', 'NOM', 'nombre', 'Nombre', 'NOMBRE'];
    nameFields.forEach(function(name){
      if(featureName == 'unknown' && row[name]){
        featureName = row[name];
      }
    });
    if(this.state.rowKey === 'mhid'){
      idVal = idVal.split(':')[1];
    }
    var url = '/feature/' + this.props.layer_id.toString() + '/' + idVal + '/' + featureName;
    window.location = url;
  },


render() {
  var _this = this;

   if(this.state.rows.length > 0 && typeof window !== 'undefined'){
      var ReactDataGrid = require('react-data-grid');
      const {Toolbar, Data: {Selectors}} = require('react-data-grid-addons');
      this.Selectors = Selectors;
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
              <button type="button" style={{marginLeft: '5px'}} className="btn" onClick={_this.onViewSelectedFeature}>
                {this.__('View Selected Feature')}
              </button>
              </Toolbar>
            }
            onAddFilter={this.handleFilterChange}
            onClearFilters={this.onClearFilters}
            />
    );
  }else{
    return(
      <div><h5>{this.state.dataMsg}</h5></div>
    );
    
  }
}

});

module.exports = LayerDataGrid;