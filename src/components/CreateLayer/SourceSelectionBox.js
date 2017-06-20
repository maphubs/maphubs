//@flow
import React from 'react';
import MapHubsPureComponent from '../MapHubsPureComponent';

type Props = {|
  onSelect: Function,
  name: string,
  value: string,
  icon: string,
  selected: boolean
|}

type DefaultProps = {
  selected: boolean
}

export default class SourceSelectionBox extends MapHubsPureComponent<DefaultProps, Props, void> {
  
  static defaultProps:DefaultProps  = {
    selected: false
  }

  constructor(props: Props) {
    super(props);
  }

  onSelect = () => {
    this.props.onSelect(this.props.value);
  }
   
  render() {

    var icon = '';  
    if(this.props.icon){
      icon = (<i className="material-icons white-text" style={{fontSize: '48px'}}>{this.props.icon}</i>);
    }
    
    return (
      <div className="card-panel center omh-color" style={{width: '125px', height: '125px', padding: '10px', marginLeft: 'auto', marginRight: 'auto'}}
        onClick={this.onSelect}>
        
        <form action="#" style={{height: '100%', position: 'relative'}} >
          {icon}
          <p className="no-margin white-text" style={{position: 'absolute', bottom: '0'}}>
          <input type="checkbox" className="filled-in" id={this.props.name + '-checkbox'} onChange={this.onSelect} checked={this.props.selected ? 'checked' : null} />
          <label className="white-text" htmlFor={this.props.name + '-checkbox'}>{this.props.name}</label>
        </p>
        </form>
        
      </div>
    );
   }
}