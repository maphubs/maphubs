import React from 'react'
import { Row, Col, Button, message, notification } from 'antd'
import ImageCrop from '../ImageCrop'
import GroupStore from '../../stores/GroupStore'
import GroupActions from '../../actions/GroupActions'

import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { GroupStoreState } from '../../stores/GroupStore'
import classNames from 'classnames'
import GroupIcon from '@material-ui/icons/Group'
type Props = {
  onSubmit: (...args: Array<any>) => void
  active: boolean
  showPrev: boolean
  onPrev: (...args: Array<any>) => void
}
type State = {
  canSubmit: boolean
} & LocaleStoreState &
  GroupStoreState
export default class CreateGroupStep2 extends React.Component<Props, State> {
  static defaultProps:
    | any
    | {
        active: boolean
      } = {
    active: false
  }
  state: State = {
    canSubmit: false,
    group: {},
    // replaced by store
    members: [] // replaced by store
  }
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [GroupStore]
  }

  submit = (): void => {
    this.props.onSubmit(this.state.group.group_id)
  }
  showImageCrop = (): void => {
    this.refs.imagecrop.show()
  }
  onCrop = (data: Record<string, any>): void => {
    const { t, state } = this
    const { _csrf } = state
    // send data to server
    GroupActions.setGroupImage(data, _csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString(),
          duration: 0
        })
      } else {
        message.success(t('Image Saved'), 3)
      }
    })
  }

  render(): JSX.Element {
    const { t, props, state, showImageCrop, submit, onCrop } = this
    const { showPrev, onPrev, active } = props
    const { group } = state
    // hide if not active
    let className = classNames('row')

    if (!active) {
      className = classNames('row', 'hidden')
    }

    // if group has an image use link,
    const groupImage =
      group && group.group_id && group.hasImage ? (
        <img
          className='responsive-img'
          width={200}
          height={200}
          src={
            '/group/' + group.group_id + '/image.png?' + new Date().getTime()
          }
        />
      ) : (
        <div
          className='circle valign-wrapper'
          style={{
            width: '200px',
            height: '200px'
          }}
        >
          <GroupIcon
            style={{
              fontSize: '100px',
              margin: 'auto'
            }}
          />
        </div>
      )

    return (
      <div className={className}>
        <div className='container'>
          <Row
            style={{
              marginBottom: '20px',
              padding: '20px'
            }}
          >
            <Col span={12}>{groupImage}</Col>
            <Col span={12}>
              <Button type='primary' onClick={showImageCrop}>
                {t('Add Image')}
              </Button>
              <p>{t('Upload an Image or Logo for Your Group (Optional)')}</p>
            </Col>
          </Row>
          <Row
            justify='center'
            align='middle'
            style={{
              marginBottom: '20px'
            }}
          >
            {showPrev && (
              <Col span={4}>
                <Button type='primary' onClick={onPrev}>
                  {t('Previous Step')}
                </Button>
              </Col>
            )}
            <Col span={4} offset={16}>
              <Button type='primary' onClick={submit}>
                {t('Save')}
              </Button>
            </Col>
          </Row>
        </div>
        <ImageCrop
          ref='imagecrop'
          aspectRatio={1}
          lockAspect
          resize_width={600}
          resize_height={600}
          onCrop={onCrop}
        />
      </div>
    )
  }
}
