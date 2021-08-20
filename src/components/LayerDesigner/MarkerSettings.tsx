import React, { useState } from 'react'
import Formsy from 'formsy-react'
import { Row } from 'antd'
import Toggle from '../forms/toggle'
import Select from '../forms/select'
import _assignIn from 'lodash.assignin'
import MapStyles from '../Maps/Map/Styles'
import useT from '../../hooks/useT'
import { Layer } from '../../types/layer'
import mapboxgl from 'mapbox-gl'
type Props = {
  onChange: (style: mapboxgl.Style, options: MarkerOptions) => void
  layer: Layer
  style: mapboxgl.Style
  color: string
}

export type MarkerOptions = {
  shape: 'MAP_PIN' | 'SQUARE_PIN' | 'SQUARE_ROUNDED' | 'SQUARE' | 'CIRCLE'
  size: string
  width: number
  height: number
  shapeFill: string
  shapeFillOpacity: number
  shapeStroke: string
  shapeStrokeWidth: number
  icon: string
  iconFill: string
  iconFillOpacity: number
  iconStroke: string
  iconStrokeWidth: number
  inverted: boolean
  enabled: boolean
}

type LayerWithMeta = mapboxgl.Layer & { metadata: Record<string, unknown> }

const MarkerSettings = ({
  style,
  color,
  onChange,
  layer
}: Props): JSX.Element => {
  const { t } = useT()

  const initialOptions: MarkerOptions = {
    shape: 'MAP_PIN',
    size: '32',
    width: 32,
    height: 32,
    shapeFill: 'red',
    shapeFillOpacity: 1,
    shapeStroke: '#323333',
    shapeStrokeWidth: 1,
    icon: 'none',
    iconFill: 'white',
    iconFillOpacity: 1,
    iconStroke: '#323333',
    iconStrokeWidth: 0,
    inverted: false,
    enabled: false
  }

  // get state from style
  if (style.layers && Array.isArray(style.layers) && style.layers.length > 0) {
    for (const glLayer of style.layers as LayerWithMeta[]) {
      if (
        glLayer.id.startsWith('omh-data-point') &&
        glLayer.metadata &&
        glLayer.metadata['maphubs:markers']
      ) {
        _assignIn(initialOptions, glLayer.metadata['maphubs:markers'])

        if (glLayer.metadata['maphubs:markers'].invert) {
          initialOptions.iconStroke = color
          initialOptions.iconFill = color
        } else {
          initialOptions.shapeFill = color
        }
      }
    }
  }
  const [options, setOptions] = useState<MarkerOptions>(initialOptions)

  const onFormChange = (model: {
    size: string
    width: string
    height: string
    inverted: boolean
    enabled: boolean
  }): void => {
    let width: number
    let height: number
    // eslint-disable-next-line unicorn/explicit-length-check
    if (model.size) {
      width = Number.parseInt(model.size, 10)
      height = Number.parseInt(model.size, 10)
    }

    const optionsClone = JSON.parse(JSON.stringify(options))
    optionsClone.size = model.size
    optionsClone.width = width
    optionsClone.height = height
    optionsClone.inverted = model.inverted
    optionsClone.enabled = model.enabled

    // invert colors
    if (model.inverted) {
      optionsClone.shapeStroke = color
      optionsClone.iconFill = color
      optionsClone.shapeFill = 'white'
      optionsClone.shapeFillOpacity = 0.75
      optionsClone.shapeStrokeWidth = 2
    } else {
      optionsClone.shapeFill = color
      optionsClone.iconFill = 'white'
      optionsClone.shapeStroke = '#323333'
      optionsClone.shapeFillOpacity = 1
      optionsClone.shapeStrokeWidth = 1
    }

    const styleUpdate = optionsClone.enabled
      ? MapStyles.markers.enableMarkers(style, options, layer)
      : MapStyles.markers.disableMarkers(style)

    setOptions(optionsClone)
    onChange(styleUpdate, options)
  }

  const shapeOptions = [
    {
      value: 'MAP_PIN',
      label: t('Map Pin')
    },
    {
      value: 'SQUARE_PIN',
      label: t('Square Pin')
    },
    {
      value: 'SQUARE_ROUNDED',
      label: t('Rounded Square')
    },
    {
      value: 'SQUARE',
      label: t('Square')
    },
    {
      value: 'CIRCLE',
      label: t('Circle')
    }
  ]
  const sizeOptions = [
    {
      value: '16',
      label: '16'
    },
    {
      value: '24',
      label: '24'
    },
    {
      value: '32',
      label: '32'
    },
    {
      value: '40',
      label: '40'
    },
    {
      value: '48',
      label: '48'
    },
    {
      value: '56',
      label: '56'
    },
    {
      value: '64',
      label: '64'
    },
    {
      value: '96',
      label: '96'
    }
  ]
  const iconOptions = [
    {
      value: 'none',
      label: t('None')
    },
    {
      value: 'maphubs-icon-boat',
      label: t('Boat')
    },
    {
      value: 'maphubs-icon-campfire',
      label: t('Campfire')
    },
    {
      value: 'maphubs-icon-cargo-ship',
      label: t('Cargo Ship')
    },
    {
      value: 'maphubs-icon-chainsaw',
      label: t('Chainsaw')
    },
    {
      value: 'maphubs-icon-chipmunk',
      label: t('Chipmunk')
    },
    {
      value: 'maphubs-icon-clearcutting',
      label: t('Clearcutting')
    },
    {
      value: 'maphubs-icon-clipboard',
      label: t('Clipboard')
    },
    {
      value: 'maphubs-icon-clinic',
      label: t('Clinic')
    },
    {
      value: 'maphubs-icon-dam',
      label: t('Dam')
    },
    {
      value: 'maphubs-icon-dolphin',
      label: t('Dolphin')
    },
    {
      value: 'maphubs-icon-elephant',
      label: t('Elephant')
    },
    {
      value: 'maphubs-icon-eye',
      label: t('Eye')
    },
    {
      value: 'maphubs-icon-factory',
      label: t('Factory')
    },
    {
      value: 'maphubs-icon-farmer',
      label: t('Farmer')
    },
    {
      value: 'maphubs-icon-farmer-family',
      label: t('Farmer Family')
    },
    {
      value: 'maphubs-icon-farmer-wife',
      label: t('Farmer Wife')
    },
    {
      value: 'maphubs-icon-fox',
      label: t('Fox')
    },
    {
      value: 'maphubs-icon-gorilla',
      label: t('Gorilla')
    },
    {
      value: 'maphubs-icon-hand-one',
      label: t('Hand')
    },
    {
      value: 'maphubs-icon-hummingbird',
      label: t('HummingBird')
    },
    {
      value: 'maphubs-icon-log-pile',
      label: t('Log Pile')
    },
    {
      value: 'maphubs-icon-magnifier',
      label: t('Magnifier')
    },
    {
      value: 'maphubs-icon-mining',
      label: t('Mining')
    },
    {
      value: 'maphubs-icon-money',
      label: t('Money')
    },
    {
      value: 'maphubs-icon-oil',
      label: t('Oil')
    },
    {
      value: 'maphubs-icon-palm-oil',
      label: t('Palm Oil')
    },
    {
      value: 'maphubs-icon-play',
      label: t('Play')
    },
    {
      value: 'maphubs-icon-sawblade',
      label: t('Sawblade')
    },
    {
      value: 'maphubs-icon-star',
      label: t('Star')
    },
    {
      value: 'maphubs-icon-tractor',
      label: t('Tractor')
    },
    {
      value: 'maphubs-icon-truck',
      label: t('Truck')
    },
    {
      value: 'maphubs-icon-tug-boat',
      label: t('Tug Boat')
    },
    {
      value: 'maphubs-icon-turtle',
      label: t('Turtle')
    },
    {
      value: 'maphubs-icon-turtle2',
      label: t('Turtle 2')
    },
    {
      value: 'maphubs-icon-video',
      label: t('Video')
    },
    {
      value: 'maphubs-icon-village',
      label: t('Village')
    },
    {
      value: 'maphubs-icon-whale',
      label: t('Whale')
    },
    {
      value: 'maphubs-icon-wifi',
      label: t('WiFi')
    },
    {
      value: 'maphubs-icon-wolf',
      label: t('Wolf')
    }
  ]
  return (
    <Row
      style={{
        marginBottom: '20px'
      }}
    >
      <Formsy onChange={onFormChange}>
        <Row
          style={{
            marginTop: '10px',
            marginBottom: '20px',
            padding: '0 .75rem'
          }}
        >
          <Row>
            <b>{t('Enable Markers')}</b>
          </Row>
          <Row>
            <Toggle
              name='enabled'
              labelOff={t('Off')}
              labelOn={t('On')}
              checked={options.enabled}
            />
          </Row>
        </Row>
        <Row
          style={{
            marginBottom: '20px',
            padding: '0 .75rem'
          }}
        >
          <Select
            name='shape'
            id='markers-shape-select'
            label={t('Marker Shape')}
            options={shapeOptions}
            value={options.shape}
            startEmpty={!options.shape}
            tooltipPosition='right'
            tooltip={t('Shape of the map marker')}
            required
          />
        </Row>
        <Row
          style={{
            marginBottom: '20px',
            padding: '0 .75rem'
          }}
        >
          <Select
            name='size'
            id='markers-size-select'
            label={t('Marker Size')}
            options={sizeOptions}
            value={options.size}
            // eslint-disable-next-line unicorn/explicit-length-check
            startEmpty={!options.size}
            tooltipPosition='right'
            tooltip={t('Size of the map marker')}
            required
          />
        </Row>
        <Row
          style={{
            marginBottom: '20px',
            padding: '0 .75rem'
          }}
        >
          <Select
            name='icon'
            id='markers-icon-select'
            label={t('Marker Icon')}
            options={iconOptions}
            value={options.icon}
            startEmpty={!options.icon}
            tooltipPosition='right'
            tooltip={t('Marker icon overlay')}
            required
          />
        </Row>
        <Row
          style={{
            padding: '0 .75rem'
          }}
        >
          <Row>
            <b>{t('Invert Colors')}</b>
          </Row>
          <Row>
            <Toggle
              name='inverted'
              labelOff={t('Off')}
              labelOn={t('On')}
              checked={options.inverted}
            />
          </Row>
        </Row>
      </Formsy>
    </Row>
  )
}
export default MarkerSettings
