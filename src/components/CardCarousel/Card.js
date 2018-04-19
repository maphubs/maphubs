// @flow
import React from 'react'
import GroupTag from '../Groups/GroupTag'
import MapCardUserTag from './MapCardUserTag'
import StoryHeader from '../Story/StoryHeader'
import MapHubsComponent from '../../components/MapHubsComponent'

import {Tooltip} from 'react-tippy'

import _isequal from 'lodash.isequal'

export type CardConfig = {|
  id: string,
  title?: LocalizedString,
  description?: LocalizedString,
  image_url?: string,
  background_image_url?: string,
  link: string,
  group?: string,
  source?: LocalizedString,
  data: Object,
  type: string,
  private?: boolean,
  onClick?: Function,
  showAddButton?: boolean
|}

type Props = CardConfig

type State = {
  mounted: boolean
}

export default class Card extends MapHubsComponent<Props, State> {
  props: Props

  state: State = {
    mounted: false
  }

  componentDidMount () {
    if (!this.state.mounted) {
      this.setState({mounted: true})
    }
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

  onClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.data)
    } else if (this.props.link) {
      if (typeof window !== 'undefined') {
        window.location = this.props.link
      }
    }
  }

  render () {
    let group = ''
    if (this.props.group) {
      group = (
        <div className='valign-wrapper' style={{position: 'absolute', bottom: 1, left: 1}}>
          <GroupTag group={this.props.group} />
        </div>

      )
    }

    /*
    var source = '';

    if(this.props.source){
      source = (
        <p className="truncate right no-margin grey-text text-darken-1" style={{fontSize: '8px', lineHeight: '10px'}}>{this._o_(this.props.source)}</p>
      );
    }
    */

    let typeIcon = ''
    let iconName = ''
    let toolTipText = ''
    let mapCardUserTag = ''
    let storyTag = ''
    if (this.props.type) {
      if (this.props.type === 'layer') {
        iconName = 'layers'
        toolTipText = this.__('Layer')
      } else if (this.props.type === 'group') {
        iconName = 'supervisor_account'
        toolTipText = this.__('Group')
      } else if (this.props.type === 'hub') {
        iconName = 'web'
        toolTipText = 'Hub'
      } else if (this.props.type === 'story') {
        iconName = 'library_books'
        toolTipText = this.__('Story')
        storyTag = (
          <div style={{position: 'absolute', bottom: 1, left: 1, width: '200px'}}>
            <StoryHeader story={this.props.data} short />
          </div>
        )
      } else if (this.props.type === 'map') {
        iconName = 'map'
        toolTipText = this.__('Map')
        if (!this.props.group) {
          mapCardUserTag = (
            <div style={{position: 'absolute', bottom: 1, left: 1, width: '200px'}}>
              <MapCardUserTag map={this.props.data} />
            </div>
          )
        }
      }

      typeIcon = (
        <Tooltip
          title={toolTipText}
          position='bottom'
          inertia
          followCursor
        >
          <i className='material-icons grey-text text-darken-3'
            style={{position: 'absolute', bottom: '6px', right: '6px'}}
          >
            {iconName}
          </i>
        </Tooltip>
      )
    }

    let privateIcon = ''
    if (this.props.private) {
      privateIcon = (
        <div style={{position: 'absolute', top: '5px', right: '5px'}}>
          <Tooltip
            title={this.__('Private')}
            position='bottom'
            inertia
            followCursor
          >
            <i className='material-icons grey-text text-darken-3'>lock</i>
          </Tooltip>
        </div>
      )
    }

    let cardContents = (<div className='carousel-card small' />)
    if (this.state.mounted) {
      let addButton = ''
      if (this.props.showAddButton) {
        addButton = (
          <a className='btn-floating halfway-fab waves-effect waves-light red'
            style={{bottom: '5px', right: '10px'}}>
            <i className='material-icons'>add</i>
          </a>
        )
      }
      let image = ''
      if (this.props.type === 'hub') {
        image = (
          <div className='card-image valign-wrapper' style={{borderBottom: '1px solid #757575', height: '150px'}}>
            <img className='responsive-img' style={{position: 'absolute', objectFit: 'cover', height: '150px'}} src={this.props.background_image_url} />
            <img className='valign' width='75' height='75' style={{position: 'relative', width: '75px', borderRadius: '15px', margin: 'auto'}} src={this.props.image_url} />
            {addButton}
          </div>
        )
      } else if (this.props.type === 'story' && !this.props.image_url) {
        image = (
          <div className='card-image valign-wrapper' style={{borderBottom: '1px solid #757575', width: '200px', height: '150px'}}>
            <i className='material-icons omh-accent-text valign center-align' style={{fontSize: '80px', margin: 'auto'}}>library_books</i>
            {addButton}
          </div>
        )
      } else if (this.props.type === 'story' && this.props.image_url) {
        image = (
          <div style={{height: '150px', width: '200px', backgroundImage: 'url(' + this.props.image_url + ')', backgroundSize: 'cover', backgroundPosition: 'center'}} >
            {addButton}
          </div>

        )
      } else if (this.props.type === 'group' && !this.props.image_url) {
        image = (
          <div className='card-image valign-wrapper' style={{borderBottom: '1px solid #757575', width: '200px', height: '150px'}}>
            <i className='material-icons omh-accent-text valign center-align' style={{fontSize: '80px', margin: 'auto'}}>supervisor_account</i>
            {addButton}
          </div>
        )
      } else if (this.props.type === 'group' && this.props.image_url) {
        image = (
          <div className='card-image' style={{borderBottom: '1px solid #757575'}}>
            <img className='responsive-img' style={{height: '150px', width: 'auto', margin: 'auto'}} src={this.props.image_url} />
            {addButton}
          </div>
        )
      } else {
        image = (
          <div className='card-image'>
            <img width='200' height='150' style={{borderBottom: '1px solid #757575'}} src={this.props.image_url} />
            {addButton}
          </div>
        )
      }

      cardContents = (
        <div ref='card' className='hoverable small carousel-card card' onClick={this.onClick}>
          {image}

          {privateIcon}
          <div className='card-content word-wrap' style={{padding: '5px'}}>

            <b>{this._o_(this.props.title)}</b> <br />

            <p className='fade' style={{fontSize: '12px'}}> {this._o_(this.props.description)}</p>
            {mapCardUserTag}
            {storyTag}
            {group}
            {typeIcon}
          </div>
        </div>
      )
    }

    return (
      <div>{cardContents}</div>
    )
  }
}
