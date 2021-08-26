import React, { useState, useEffect } from 'react'
import { Row, Col, Button, Divider } from 'antd'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import PublishIcon from '@material-ui/icons/Publish'
import SatelliteIcon from '@material-ui/icons/Satellite'
import PinDropIcon from '@material-ui/icons/PinDrop'
import TimelineIcon from '@material-ui/icons/Timeline'
import CropDinIcon from '@material-ui/icons/CropDin'
import LayerSourceHelper from './LayerSourceHelper'
import SourceSelectionBox from './SourceSelectionBox'
import useT from '../../hooks/useT'
import { Element, scroller } from 'react-scroll'

type Props = {
  onSubmit: () => void
  showPrev?: boolean
  onCancel: () => void
  mapConfig: Record<string, any>
  showCancel?: boolean
  cancelText?: string
}
type State = {
  canSubmit: boolean
  source: string
}
const CreateLayer = ({
  showCancel,
  onCancel,
  cancelText,
  mapConfig,
  onSubmit
}: Props): JSX.Element => {
  const { t } = useT()
  const [canSubmit, setCanSubmit] = useState(false)
  const [source, setSource] = useState('')

  useEffect(() => {
    if (source) {
      scroller.scrollTo('scrollToSourceDisplay')
    }
  }, [source])

  const sourceDisplay = LayerSourceHelper.getSource(source, mapConfig, t)
  return (
    <>
      <style jsx global>
        {`
          .section-header {
            margin: 5px;
            font-weight: 700;
            text-align: center;
          }
          .source-icon {
            font-size: 48px !important;
            color: ${process.env.NEXT_PUBLIC_PRIMARY_COLOR};
          }
        `}
      </style>
      <div className='container'>
        <Row
          justify='center'
          align='top'
          style={{
            maxWidth: '850px'
          }}
        >
          <Col sm={24} md={10}>
            <p className='section-header'>{t('Upload Data')}</p>
            <Row
              justify='center'
              align='middle'
              style={{
                border: '1px solid #ddd'
              }}
            >
              <Col
                span={12}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('Upload File')}
                  value='local'
                  selected={source === 'local'}
                  icon={<PublishIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
              <Col
                span={12}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('MapHubs Layer')}
                  value='remote'
                  selected={source === 'remote'}
                  icon={<PublishIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
            </Row>
            <p className='section-header'>{t('Satellite Data')}</p>
            <Row
              justify='center'
              align='middle'
              style={{
                border: '1px solid #ddd'
              }}
            >
              <Col
                span={12}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('Upload Raster')}
                  value='raster-upload'
                  selected={source === 'raster-upload'}
                  icon={<PublishIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
              {process.env.NEXT_PUBLIC_PLANET_LABS_API_KEY && (
                <Col
                  span={12}
                  style={{
                    padding: '20px'
                  }}
                >
                  <SourceSelectionBox
                    name={t('Planet API')}
                    value='planet'
                    selected={source === 'planet'}
                    icon={<SatelliteIcon className='source-icon' />}
                    onSelect={setSource}
                  />
                </Col>
              )}
              <Col
                span={12}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('Digital Globe')}
                  value='dgwms'
                  selected={source === 'dgwms'}
                  icon={<SatelliteIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
              <Col
                span={12}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('Earth Engine')}
                  value='earthengine'
                  selected={source === 'earthengine'}
                  icon={<SatelliteIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
            </Row>
          </Col>
          <Col sm={24} md={14}>
            <p className='section-header'>{t('Create New Data')}</p>
            <Row
              justify='center'
              align='middle'
              style={{
                border: '1px solid #ddd'
              }}
            >
              <Col
                sm={12}
                md={8}
                lg={8}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('New Point(s)')}
                  value='point'
                  selected={source === 'point'}
                  icon={<PinDropIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
              <Col
                sm={12}
                md={8}
                lg={8}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('New Line(s)')}
                  value='line'
                  selected={source === 'line'}
                  icon={<TimelineIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
              <Col
                sm={12}
                md={8}
                lg={8}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('New Polygon(s)')}
                  value='polygon'
                  selected={source === 'polygon'}
                  icon={<CropDinIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
            </Row>
            <p className='section-header'>{t('Remote Data Sources')}</p>
            <Row
              justify='center'
              align='middle'
              style={{
                border: '1px solid #ddd'
              }}
            >
              <Col
                sm={12}
                md={8}
                lg={8}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('GeoJSON URL')}
                  value='geojson'
                  selected={source === 'geojson'}
                  icon={<CloudUploadIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
              <Col
                sm={12}
                md={8}
                lg={8}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('Mapbox Styles')}
                  value='mapbox'
                  selected={source === 'mapbox'}
                  icon={<CloudUploadIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
              <Col
                sm={12}
                md={8}
                lg={8}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('Raster Tiles')}
                  value='raster'
                  selected={source === 'raster'}
                  icon={<CloudUploadIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
              <Col
                sm={12}
                md={8}
                lg={8}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('Vector Tiles')}
                  value='vector'
                  selected={source === 'vector'}
                  icon={<CloudUploadIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
              <Col
                sm={12}
                md={8}
                lg={8}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('ArcGIS Services')}
                  value='ags'
                  selected={source === 'ags'}
                  icon={<CloudUploadIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
              <Col
                sm={12}
                md={8}
                lg={8}
                style={{
                  padding: '20px'
                }}
              >
                <SourceSelectionBox
                  name={t('WMS')}
                  value='wms'
                  selected={source === 'wms'}
                  icon={<CloudUploadIcon className='source-icon' />}
                  onSelect={setSource}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
      <Divider />
      <Element name='scrollToSourceDisplay'>
        <div
          className='container'
          style={{
            marginBottom: '20px'
          }}
        >
          {sourceDisplay}
        </div>
      </Element>
      {showCancel && (
        <Row
          style={{
            paddingLeft: '20px',
            marginBottom: '20px'
          }}
        >
          <Button type='primary' danger onClick={onCancel}>
            {cancelText}
          </Button>
        </Row>
      )}
    </>
  )
}
export default CreateLayer
