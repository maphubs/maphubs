import React from 'react'
import Formsy from 'formsy-react'
import Header from '../components/header'
import SelectGroup from '../components/Groups/SelectGroup'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import MessageActions from '../actions/MessageActions'
import FileUpload from '../components/forms/FileUpload'
import Progress from '../components/Progress'
import ErrorBoundary from '../components/ErrorBoundary'

type Props = {|
  groups: Array,
  locale: string,
  headerConfig: Object
|}

type State = {
  layer_id?: number,
  group_id?: string
}

export default class ImportLayer extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    groups: []
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
  }

  componentDidMount () {
    const _this = this
    window.onbeforeunload = function () {
      if (_this.state.group_id && !_this.state.layer_id) {
        return _this.__('You have not finished importing your layer.')
      }
    }
  }

  onGroupChange = (groupId: string) => {
    this.setState({group_id: groupId})
  }

  onUpload = (result: Object) => {
    if (result.success) {
      this.setState({layer_id: result.layer_id, processing: false})
    } else {
      MessageActions.showMessage({title: this.__('Error'), message: result.error})
      this.setState({processing: false})
    }
  }

  onUploadError = (err: string) => {
    MessageActions.showMessage({title: this.__('Error'), message: err})
  }

  onProcessingStart = () => {
    this.setState({processing: true})
  }

  render () {
    if (!this.props.groups || this.props.groups.length === 0) {
      return (
        <ErrorBoundary>
          <Header {...this.props.headerConfig} />
          <main>
            <div className='container'>
              <div className='row'>
                <h5>{this.__('Please Join a Group')}</h5>
                <p>{this.__('Please create or join a group before creating a layer.')}</p>
              </div>
            </div>
          </main>
        </ErrorBoundary>
      )
    }

    let groupSelection
    if (!this.state.group_id) {
      groupSelection = (
        <div className='row'>
          <Formsy>
            <SelectGroup groups={this.props.groups} onGroupChange={this.onGroupChange} type='layer' />
          </Formsy>
        </div>
      )
    }

    let importComplete
    if (this.state.layer_id) {
      importComplete = (
        <div className='row'>
          <p>{this.__('Import Complete')}</p>
          <a className='btn' href={`/lyr/${this.state.layer_id}`}>{this.__('Go to Layer')}</a>
        </div>
      )
    }

    let uploadBox
    if (this.state.group_id && !this.state.layer_id) {
      const url = `/api/import/layer/${this.state.group_id}/upload`
      uploadBox = (
        <div className='row'>
          <p>{this.__('Please upload a MapHubs (.maphubs) file')}</p>
          <FileUpload onUpload={this.onUpload} onFinishTx={this.onProcessingStart} onError={this.onUploadError} action={url} />
        </div>
      )
    }

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main>
          <h4>{this.__('Import Layer')}</h4>
          <div className='container center'>
            {groupSelection}
            {uploadBox}
            {importComplete}
          </div>
          <Progress id='load-data-progess' title={this.__('Loading Data')} subTitle={this.__('Data Loading: This may take a few minutes for larger datasets.')} dismissible={false} show={this.state.processing} />
        </main>
      </ErrorBoundary>
    )
  }
}
