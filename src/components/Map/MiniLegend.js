// @flow
import React from 'react'
import { Subscribe } from 'unstated'
import BaseMapContainer from './containers/BaseMapContainer'
import LegendItem from './LegendItem'
import MapStyles from './Styles'
import {Row, Col} from 'antd'
import Settings from '@material-ui/icons/Settings'
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp'

type Props = {|
  title?: LocalizedString,
  layers: Array<Object>,
  hideInactive: boolean,
  collapsible: boolean,
  showLayersButton: boolean,
  openLayersPanel?: Function,
  maxHeight: string,
  style: Object,
  t: Function
|}

type State = {|
  collapsed: boolean
|}

export default class MiniLegend extends React.Component<Props, State> {
  props: Props

  static defaultProps = {
    layers: [],
    hideInactive: true,
    collapsible: true,
    showLayersButton: true,
    maxHeight: '100%',
    style: {}
  }

  state: State = {
    collapsed: false
  }

  toggleCollapsed = (e: Event) => {
    this.setState({
      collapsed: !this.state.collapsed
    })
  }

  openLayersPanel = () => {
    if (this.props.openLayersPanel) {
      this.props.openLayersPanel()
    }
  }

  render () {
    const _this = this
    const {t, title, showLayersButton} = this.props
    const {collapsed} = this.state

    let layersButton = ''
    if (showLayersButton) {
      layersButton = (
        <a
          href='#'
          onMouseDown={this.openLayersPanel}
          style={{
            position: 'absolute',
            right: '20px',
            display: 'table-cell',
            height: '32px',
            zIndex: '100',
            lineHeight: '32px'
          }}
        >
          <Settings
            style={{
              color: '#000',
              textAlign: 'center',
              fontSize: '18px',
              verticalAlign: 'middle'
            }}
          />
        </a>
      )
    }

    let titleText = ''
    let titleFontSize = '15px'
    if (title) {
      titleText = t(title)
      if (titleText) {
        if (titleText.length > 80) {
          titleFontSize = '8px'
        } else if (titleText.length > 60) {
          titleFontSize = '11px'
        } else if (titleText.length > 40) {
          titleFontSize = '13px'
        }
      } else {
        // if localized text is empty
        titleText = t('Legend')
      }
    } else {
      titleText = t('Legend')
    }

    let titleDisplay = ''
    if (this.props.collapsible) {
      const iconStyle = {
        marginRight: 0,
        height: '100%',
        lineHeight: '32px',
        verticalAlign: 'middle'
      }

      titleDisplay = (
        <Row style={{height: '32px', width: '100%'}}>
          <Col span={20} className='valign-wrapper' style={{height: '32px'}}>
            <h6 className='black-text valign word-wrap' style={{
              padding: '0.2rem',
              marginLeft: '2px',
              marginTop: '0px',
              marginBottom: '2px',
              fontWeight: '500',
              fontSize: titleFontSize
            }}>{titleText}</h6>
          </Col>
          <Col span={4} className='no-padding valign'>
            {layersButton}
            <span style={{
              float: 'right',
              display: 'table-cell',
              height: '32px',
              zIndex: '100',
              lineHeight: '32px'
            }}>
              {collapsed &&
                <KeyboardArrowDown style={iconStyle} />
              }
              {!collapsed &&
                <KeyboardArrowUp style={iconStyle} />
              }
            </span>
          </Col>
        </Row>
      )
    } else {
      titleDisplay = (
        <Row className='valign-wrapper' style={{height: '32px', width: '100%'}}>
          <h6 className='black-text valign' style={{
            padding: '0.2rem',
            marginLeft: '2px',
            fontWeight: '500',
            fontSize: titleFontSize
          }}>{titleText}</h6>
          <Col span={4} className='valign'>
            {layersButton}
          </Col>
        </Row>
      )
    }

    let allowScroll = true
    if (collapsed || this.props.layers.length === 1) {
      allowScroll = false
    }

    let contentHeight = `calc(${this.props.maxHeight} - 32px)`
    let legendHeight = this.props.maxHeight
    if (collapsed) {
      contentHeight = '0px'
      legendHeight = '0px'
    }

    // var style = this.props.style;
    // style.height = '9999px'; //needed for the flex box to work correctly

    return (
      <div style={this.props.style}>
        <style jsx global>{`
          .omh-legend {
            padding-left: 2px;
            padding-right: 2px;
            padding-top: 2px;
            padding-bottom: 4px;
            min-height: 20px;
          }

          .omh-legend h3 {
              font-size: 10px;
              color: #212121;
              margin: 0px;
          }

          .base-map-legend * {
              color: #212121 !important;
          }

          .omh-legend .block {
            height: 15px;
            width: 20px;
            float: left;
            margin-right: 5px;
            border: 1px solid #888;
          }

          .omh-legend .point {
            height: 15px;
            width: 15px;
            float: left;
            margin-right: 5px;
            border-radius: 50%;
            border: 1px solid #888;
          }

          .omh-legend  .double-stroke {
            box-shadow: inset 0 0 0 3px rgba(100, 100, 100, 0.2);
          }

          .word-wrap {
            overflow-wrap: break-word;
            word-wrap: break-word;
            -ms-word-break: break-all;
            word-break: break-word;
            -ms-hyphens: auto;
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            hyphens: auto;
          }
        `}</style>
        <ul ref='legend' className='collapsible'
          style={{
            zIndex: 1,
            textAlign: 'left',
            margin: 0,
            position: 'absolute',
            height: legendHeight,
            width: '100%',
            boxShadow: 'none',
            pointerEvents: 'none',
            border: 'none',
            paddingLeft: '0px',
            listStyleType: 'none'
          }}>
          <li className='z-depth-1 active'
            style={{
              backgroundColor: '#FFF',
              height: 'auto',
              pointerEvents: 'auto',
              borderTop: '1px solid #ddd',
              borderRight: '1px solid #ddd',
              borderLeft: '1px solid #ddd'}}>
            <div className='collapsible-header no-padding' style={{height: '32px', minHeight: '32px'}} onClick={this.toggleCollapsed}>
              {titleDisplay}
            </div>
            <div
              style={{
                display: collapsed ? 'none' : 'flex',
                maxHeight: contentHeight,
                flexDirection: 'column',
                borderBottom: 'none'}}>
              <div className='no-margin'
                style={{
                  overflowX: 'hidden',
                  overflowY: allowScroll ? 'auto' : 'hidden',
                  maxHeight: contentHeight,
                  padding: '5px'}}>
                {
                  this.props.layers.map((layer) => {
                    let active = MapStyles.settings.get(layer.style, 'active')
                    if (typeof active === 'undefined') {
                      layer.style = MapStyles.settings.set(layer.style, 'active', true)
                      active = true
                    }
                    if (_this.props.hideInactive && !active) {
                      return null
                    }
                    return (<LegendItem key={layer.layer_id} layer={layer} t={t} />)
                  })
                }
                <Subscribe to={[BaseMapContainer]}>
                  {BaseMap => (
                    <div className='base-map-legend' style={{lineHeight: '0.75em', padding: '2px'}}>
                      <span style={{fontSize: '6px', float: 'left', backgroundColor: '#FFF'}}
                        className='grey-text align-left'>{t('Base Map')} - <span className='no-margin no-padding' dangerouslySetInnerHTML={{__html: BaseMap.state.attribution}} /></span>
                    </div>
                  )}
                </Subscribe>
              </div>
            </div>
          </li>
        </ul>
      </div>
    )
  }
}
