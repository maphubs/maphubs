// @flow
import React from 'react'
import MapHubsPureComponent from '../../MapHubsPureComponent'
import Formsy from 'formsy-react'
import Toggle from '../../forms/toggle'
import AnimationActions from '../../../actions/map/AnimationActions'

type Props = {|
  forestAlerts: Object,
  forestLoss: Object,
  toggleForestAlerts: Function,
  toggleForestLoss:Function,
  calculateForestAlerts: Function
|}

export default class ForestAlertPanel extends MapHubsPureComponent<Props, void> {
  props: Props

  render () {
    let forestAlertsResult = ''
    if (this.props.forestAlerts.result) {
      forestAlertsResult = (

        <div>
          <div className='row no-margin'>
            <div className='col s12' style={{height: '50px', border: '1px solid #ddd'}}>
              <span><b>{this.__('Alert Count: ')}</b>{this.props.forestAlerts.result.alertCount}</span>
            </div>
          </div>
          <div className='row no-margin'>
            <div className='col s12' style={{height: '50px', border: '1px solid #ddd'}}>
              <span><b>{this.__('Total Area: ')}</b>{this.props.forestAlerts.result.areaMessage}</span>
            </div>
          </div>
        </div>
      )
    }

    /*
      <Formsy onChange={this.toggleForestAlerts}>
          <b>{this.__('2017 GLAD Alerts')}</b>
          <Toggle name="enableGLAD2017"
              labelOff={this.__('Off')} labelOn={this.__('On')}
              className="col s12"
              checked={this.props.forestAlerts.enableGLAD2017}
          />
        </Formsy>
        <button className="btn" onClick={this.props.calculateForestAlerts}>{this.__('Calculate')}</button>
        {forestAlertsResult}
    */

    return (
      <div>
        <Formsy onChange={this.toggleForestLoss}>
          <b>{this.__('2001 - 2014 Forest Loss')}</b>
          <Toggle name='enableForestLoss'
            labelOff={this.__('Off')} labelOn={this.__('On')}
            className='col s12'
            checked={this.props.forestLoss.enableForestLoss}
          />
        </Formsy>
        <button className='btn-floating' style={{marginRight: '5px'}} onClick={AnimationActions.play}><i className='material-icons'>play_arrow</i></button>
        <button className='btn-floating' onClick={AnimationActions.stop}><i className='material-icons'>pause</i></button>
      </div>
    )
  }
}
