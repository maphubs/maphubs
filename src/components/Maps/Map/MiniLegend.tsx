import React, { useState } from 'react'
import LegendItem from './LegendItem'
import MapStyles from './Styles'
import { Row, Col } from 'antd'
import Settings from '@material-ui/icons/Settings'
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp'
import { LocalizedString } from '../../../types/LocalizedString'
import { Layer } from '../../../types/layer'
import useMapT from '../hooks/useMapT'
import { useSelector } from '../redux/hooks'

type Props = {
  title?: LocalizedString
  layers: Layer[]
  hideInactive: boolean
  collapsible: boolean
  showLayersButton: boolean
  openLayersPanel?: () => void
  maxHeight: string
  style: React.CSSProperties
}
type State = {
  collapsed: boolean
}
const MiniLegend = ({
  title,
  layers,
  showLayersButton,
  hideInactive,
  collapsible,
  maxHeight,
  style,
  openLayersPanel
}: Props): JSX.Element => {
  const { t } = useMapT()
  const [collapsed, setCollapsed] = useState(false)

  const baseMapAttribution = useSelector((state) => state.baseMap.attribution)
  const toggleCollapsed = (): void => {
    setCollapsed(!collapsed)
  }

  let layersButton = <></>

  if (showLayersButton) {
    layersButton = (
      <a
        href='#'
        onMouseDown={() => {
          if (openLayersPanel) openLayersPanel()
        }}
        style={{
          position: 'absolute',
          right: '20px',
          display: 'table-cell',
          height: '32px',
          zIndex: 100,
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

  let titleDisplay

  if (collapsible) {
    const iconStyle = {
      marginRight: 0,
      height: '100%',
      lineHeight: '32px',
      verticalAlign: 'middle'
    }
    titleDisplay = (
      <Row
        style={{
          height: '32px',
          width: '100%'
        }}
      >
        <Col
          span={20}
          style={{
            height: '32px'
          }}
        >
          <h6
            className='word-wrap'
            style={{
              padding: '0.2rem',
              marginLeft: '2px',
              marginTop: '0px',
              marginBottom: '2px',
              fontWeight: 500,
              fontSize: titleFontSize
            }}
          >
            {titleText}
          </h6>
        </Col>
        <Col span={4}>
          {layersButton}
          <span
            style={{
              float: 'right',
              display: 'table-cell',
              height: '32px',
              zIndex: 100,
              lineHeight: '32px'
            }}
          >
            {collapsed && <KeyboardArrowDown style={iconStyle} />}
            {!collapsed && <KeyboardArrowUp style={iconStyle} />}
          </span>
        </Col>
      </Row>
    )
  } else {
    titleDisplay = (
      <Row
        style={{
          height: '32px',
          width: '100%'
        }}
      >
        <h6
          style={{
            padding: '0.2rem',
            marginLeft: '2px',
            marginBottom: '2px',
            fontWeight: 500,
            fontSize: titleFontSize
          }}
        >
          {titleText}
        </h6>
        <Col span={4} className='valign'>
          {layersButton}
        </Col>
      </Row>
    )
  }

  let allowScroll = true

  if (collapsed || layers.length === 1) {
    allowScroll = false
  }

  let contentHeight = `calc(${maxHeight} - 32px)`
  let legendHeight = maxHeight

  if (collapsed) {
    contentHeight = '0px'
    legendHeight = '0px'
  }

  // var style = this.props.style;
  // style.height = '9999px'; //needed for the flex box to work correctly
  return (
    <div style={style}>
      <style jsx global>
        {`
          .omh-legend {
            padding-left: 2px;
            padding-right: 2px;
            padding-top: 2px;
            padding-bottom: 4px;
            min-height: 20px;
          }

          .omh-legend h3 {
            font-size: 10px;
            color: #323333;
            margin: 0px;
          }

          .base-map-legend * {
            color: #323333 !important;
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

          .omh-legend .double-stroke {
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
          }

          .word-wrap {
            overflow-wrap: break-word;
            -ms-word-break: break-all;
            -ms-hyphens: auto;
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            hyphens: auto;
          }

          .collapsible-header {
            display: flex;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            line-height: 1.5;
            padding: 1rem;
            background-color: #fff;
            border-bottom: 1px solid #ddd;
          }
        `}
      </style>
      <ul
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
        }}
      >
        <li
          className='z-depth-1 active'
          style={{
            backgroundColor: '#FFF',
            height: 'auto',
            pointerEvents: 'auto',
            borderTop: '1px solid #ddd',
            borderRight: '1px solid #ddd',
            borderLeft: '1px solid #ddd'
          }}
        >
          <div
            className='collapsible-header no-padding'
            style={{
              height: '32px',
              minHeight: '32px'
            }}
            onClick={toggleCollapsed}
          >
            {titleDisplay}
          </div>
          <div
            style={{
              display: collapsed ? 'none' : 'flex',
              maxHeight: contentHeight,
              flexDirection: 'column',
              borderBottom: 'none'
            }}
          >
            <div
              className='no-margin'
              style={{
                overflowX: 'hidden',
                overflowY: allowScroll ? 'auto' : 'hidden',
                maxHeight: contentHeight,
                padding: '5px'
              }}
            >
              {layers.map((layer) => {
                let active = MapStyles.settings.get(layer.style, 'active')

                if (typeof active === 'undefined') {
                  layer.style = MapStyles.settings.set(
                    layer.style,
                    'active',
                    true
                  )
                  active = true
                }

                if (hideInactive && !active) {
                  return null
                }

                return <LegendItem key={layer.layer_id} layer={layer} t={t} />
              })}
              <div
                className='base-map-legend'
                style={{
                  lineHeight: '0.75em',
                  padding: '2px'
                }}
              >
                <span
                  style={{
                    fontSize: '8px',
                    float: 'left',
                    backgroundColor: '#FFF'
                  }}
                  className='align-left'
                >
                  {t('Base Map')} -{' '}
                  <span
                    className='no-margin no-padding'
                    dangerouslySetInnerHTML={{
                      __html: baseMapAttribution
                    }}
                  />
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  )
}
MiniLegend.defaultProps = {
  layers: [],
  hideInactive: true,
  collapsible: true,
  showLayersButton: true,
  maxHeight: '100%',
  style: {}
}
export default MiniLegend
