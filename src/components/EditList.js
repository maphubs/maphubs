var React = require('react');

var EditList = React.createClass({

  propTypes: {
    title: React.PropTypes.string.isRequired,
    items: React.PropTypes.array, // Array of objects with key, label, optional type, optional icon or avatar, and optional action button [{key,label, icon, image, actionIcon, actionLabel}]
    onDelete: React.PropTypes.func.isRequired,
    onAction: React.PropTypes.func,
    onError: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      items: []
    }
  },

  onDelete(key) {
    this.props
      .onDelete(key);
  },

  onAction(key) {
    this.props
      .onAction(key);
  },

  render() {
    var _this = this;

    return (
      <ul className="collection with-header">
        <li className="collection-header">
          <h5>{this.props.title}</h5>
        </li>
        {this.props.items.map(function (item) {
            var icon = '';
            var className = 'collection-item';
            if (item.image) {
              icon = (
                <img alt="" className="circle" src={item.image}/>
              );
              className = 'collection-item avatar';
            } else if (item.icon) {
              icon = (
                <i className="material-icons circle">{item.icon}</i>
              );
              className = 'collection-item avatar';
            }

            var action = '';
            if (item.actionIcon && item.actionLabel) {
              action = (
                <a className="tooltipped" data-delay="50" data-position="bottom" data-tooltip={item.actionLabel}>
                  <i className="material-icons" onClick={function () {
                    _this.onAction(item)
                  }} style={{cursor: 'pointer'}}>{item.actionIcon}</i>
                </a>
              );
            }

            var type = '';
            if (item.type) {
              type = (
                <p>{item.type}</p>
              );
            }

            return <li className={className} key={item.key}>
                {icon}
                <span className="title">
                  <b>{item.label}</b>
                </span>
                {type}
                <div className="secondary-content">
                  {action}
                  <a className="tooltipped" data-delay="50" data-position="bottom" data-tooltip="Remove" >
                    <i className="material-icons"onClick={function () {
                      _this.onDelete(item)
                    }} style={{
                      cursor: 'pointer'
                    }}>delete</i>
                  </a>
                </div>
              </li>
          })}
      </ul>
    );
  }

});

module.exports = EditList;