// @flow
import React from 'react'
import {Modal, ModalContent, ModalFooter} from './Modal/Modal'
import MessageActions from '../actions/MessageActions'
import MessageStore from '../stores/MessageStore'
import MapHubsComponent from './MapHubsComponent'
import _isequal from 'lodash.isequal'
import type {MessageStoreState} from '../stores/MessageStore'
const debug = require('../services/debug')('message')

type Props = {}

export default class Message extends MapHubsComponent<Props, MessageStoreState> {
  constructor (props: Props) {
    super(props)
    this.stores.push(MessageStore)
  }

  shouldComponentUpdate (nextProps: Props, nextState: MessageStoreState) {
    // only update if something changes

    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

  onDismiss = () => {
    MessageActions.dismissMessage()
  }

  render () {
    /* eslint-disable react/no-danger */

    let messageDisplay = ''
    let message
    if (this.state.message) {
      try {
        message = JSON.parse(this.state.message)
      } catch (err) {
        debug.error(err)
        message = this.state.message
      }
    }
    if (typeof message === 'string') {
      messageDisplay = (
        <div dangerouslySetInnerHTML={{__html: message}} />
      )
    } else if (Array.isArray(message) && message.length > 0) {
      messageDisplay = (
        <table>
          <tbody>
            {
              message.map((messageItem, i) => {
                if (typeof messageItem === 'string') {
                  return (
                    <tr><td>{messageItem}</td></tr>
                  )
                } else if (typeof messageItem === 'object') {
                  return (
                    <tr key={i}>{
                      Object.keys(messageItem).map(key => {
                        const val = JSON.stringify(messageItem[key])
                        return (
                          <td key={key}><b>{key}:</b>{val}</td>
                        )
                      })
                    }</tr>
                  )
                } else {
                  return (
                    <tr>{messageItem.toString()}</tr>
                  )
                }
              })
            }
          </tbody>
        </table>
      )
    } else {
      messageDisplay = (
        <div dangerouslySetInnerHTML={{__html: this.state.message.toString()}} />
      )
    }

    return (
      <Modal id='message-modal' show={this.state.show} fixedFooter={false}>
        <ModalContent>
          <h4>{this.state.title}</h4>
          {messageDisplay}
        </ModalContent>
        <ModalFooter>
          <a href='#!' className=' modal-action modal-close waves-effect waves-light btn-flat' onClick={this.onDismiss}>{this.__('Okay')}</a>
        </ModalFooter>
      </Modal>
    )
    /* eslint-enable react/no-danger */
  }
}
