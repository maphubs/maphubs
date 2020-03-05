// @flow
import React from 'react'
import { Row, Col, Button, message, notification } from 'antd'
import ImageCrop from '../ImageCrop'
import GroupStore from '../../stores/GroupStore'
import GroupActions from '../../actions/GroupActions'
import MapHubsComponent from '../../components/MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {GroupStoreState} from '../../stores/GroupStore'
import classNames from 'classnames'

type Props = {|
  onSubmit: Function,
  active: boolean,
  showPrev: boolean,
  onPrev: Function
|}

type State = {
  canSubmit: boolean
} & LocaleStoreState & GroupStoreState

export default class CreateGroupStep2 extends MapHubsComponent<Props, State> {
  static defaultProps = {
    active: false
  }

  state: State = {
    canSubmit: false,
    group: {}, // replaced by store
    members: [] // replaced by store
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(GroupStore)
  }

  submit = () => {
    this.props.onSubmit(this.state.group.group_id)
  }

  showImageCrop = () => {
    this.refs.imagecrop.show()
  }

  onCrop = (data: Object) => {
    const {t} = this
    // send data to server
    GroupActions.setGroupImage(data, this.state._csrf, (err) => {
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

  render () {
    const {t} = this
    const { showPrev } = this.props
    const { group } = this.state
    // hide if not active
    let className = classNames('row')
    if (!this.props.active) {
      className = classNames('row', 'hidden')
    }

    let groupImage = ''
    // if group has an image use link,
    if (group && group.group_id && group.hasImage) {
      groupImage = (
        <img className='responsive-img' width={200} height={200} src={'/group/' + group.group_id + '/image?' + new Date().getTime()} />
      )
    } else {
    // else show default image
      groupImage = (
        <div className='circle valign-wrapper' style={{width: '200px', height: '200px'}}>
          <i className='material-icons' style={{fontSize: '100px', margin: 'auto'}}>group</i>
        </div>

      )
    }

    return (
      <div className={className}>
        <div className='container'>
          <Row style={{marginBottom: '20px', padding: '20px'}}>
            <Col span={12}>
              {groupImage}
            </Col>
            <Col span={12}>
              <Button type='primary' onClick={this.showImageCrop}>{t('Add Image')}</Button>
              <p>{t('Upload an Image or Logo for Your Group (Optional)')}</p>
            </Col>
          </Row>
          <Row style={{marginBottom: '20px'}}>
            {showPrev &&
              <div className='left'>
                <Button type='primary' onClick={this.props.onPrev}>{t('Previous Step')}</Button>
              </div>}
            <div className='right'>
              <Button type='primary' onClick={this.submit}>{t('Save')}</Button>
            </div>
          </Row>
        </div>
        <ImageCrop ref='imagecrop' aspectRatio={1} lockAspect resize_width={600} resize_height={600} onCrop={this.onCrop} />
      </div>
    )
  }
}
