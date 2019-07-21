//  @flow
import * as React from 'react'
import { Input, Tabs } from 'antd'

const TabPane = Tabs.TabPane

type Props = {
  value?: Object,
  onChange?: Function,
  placeholder?: string,
  languages: Array<string>
}

type State = {
  value: Object
}

export default class LocalizedInput extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    const value = props.value || {}
    this.state = { value }
  }

  static defaultProps = {
    languages: ['en', 'fr', 'es', 'id', 'pt', 'it', 'de']
  }

  componentWillReceiveProps (nextProps: Props) {
    if ('value' in nextProps && !this.state.value) {
      const value = nextProps.value
      this.setState({value})
    }
  }

  handleChange = (lang: string, val: string) => {
    let changedValue = {}
    changedValue[lang] = val

    this.setState({
      value: Object.assign({}, this.state.value, changedValue)
    })

    const onChange = this.props.onChange
    if (onChange) {
      onChange(Object.assign({}, this.state.value, changedValue))
    }
  }

  render () {
    const {value} = this.state
    const {placeholder, languages} = this.props
    const {handleChange} = this
    return (
      <div>
        <style jsx>{`

          .localized-input {
            padding-bottom: 0px;
          }
          
        `}
        </style>
        <div className='localized-input'>
          <Tabs animated={false} size='small' tabBarStyle={{margin: 0}} >
            {languages.map(lang => {
              return (
                <TabPane tab={lang} key={lang}>
                  <Input type='text' value={value[lang]}
                    placeholder={placeholder}
                    onChange={
                      (e) => {
                        const val = e.target.value
                        handleChange(lang, val)
                      }
                    }
                  />
                </TabPane>
              )
            })
            }
          </Tabs>
        </div>
      </div>
    )
  }
}
