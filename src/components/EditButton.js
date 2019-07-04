// @flow
import React from 'react'

type Props = {
  editing: boolean,
  startEditing: Function,
  stopEditing: Function,
  style: Object
}

export default class EditButton extends React.Component<Props, void> {
  static defaultProps = {
    style: {}
  }

  componentDidMount () {
    M.FloatingActionButton.init(this.refs.button, {})
  }

  shouldComponentUpdate (nextProps: Props) {
    if (this.props.editing !== nextProps.editing) {
      return true
    }
    return false
  }

  render () {
    let button = ''
    if (this.props.editing) {
      button = (
        <a onClick={this.props.stopEditing} className='btn-floating btn-large omh-accent-text'>
          <i className='large material-icons'>save</i>
        </a>
      )
    } else {
      button = (
        <a onClick={this.props.startEditing} className='btn-floating btn-large omh-accent-text'>
          <i className='large material-icons'>mode_edit</i>
        </a>
      )
    }
    return (
      <div ref='button' style={this.props.style} className='fixed-action-btn action-button-bottom-right'>
        {button}
      </div>
    )
  }
}
