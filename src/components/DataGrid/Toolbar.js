const React = require('react');
import PropTypes from 'prop-types';

const Toolbar = React.createClass({
  propTypes: {
    onAddRow: PropTypes.func,
    onToggleFilter: PropTypes.func,
    onToggleFilterCallback: PropTypes.func,
    enableFilter: PropTypes.bool,
    numberOfRows: PropTypes.number,
    filterButtonText: PropTypes.string,
    viewFeatureButtonText: PropTypes.string,
    onViewFeatureCallback: PropTypes.func
  },

  onAddRow() {
    if (this.props.onAddRow !== null && this.props.onAddRow instanceof Function) {
      this.props.onAddRow({newRowIndex: this.props.numberOfRows});
    }
  },

  getDefaultProps(): {enableAddRow: boolean} {
    return {
      enableAddRow: true
    };
  },

  renderAddRowButton(): ReactElement {
    if (this.props.onAddRow ) {
      return (<button type="button" className="btn" onClick={this.onAddRow}>
        Add Row
      </button>);
    }
  },

  handleToggle(e){
    this.props.onToggleFilter(e);
    if(this.props.onToggleFilterCallback) this.props.onToggleFilterCallback();
  },

  renderToggleFilterButton(): ReactElement {
    if (this.props.enableFilter) {
      return (<button type="button" className="btn" onClick={this.handleToggle}>
      {this.props.filterButtonText}
    </button>);
    }
  },

  renderViewFeatureButton(): ReactElement {
    if (this.props.viewFeatureButtonText) {
      return (<button type="button" style={{marginRight: '5px'}} className="btn" onClick={this.props.onViewFeatureCallback}>
      {this.props.viewFeatureButtonText}
    </button>);
    }
  },

  render(): ?ReactElement {
    return (
      <div className="react-grid-Toolbar">
        <div className="tools">
          {this.renderAddRowButton()}
          {this.renderViewFeatureButton()}
          {this.renderToggleFilterButton()}
        </div>
      </div>);
  }
});

module.exports = Toolbar;
