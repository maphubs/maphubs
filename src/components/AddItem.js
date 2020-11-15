// @flow
import type {Node} from "React";// $FlowFixMe

import React from 'react'
import { Row, Col, Button } from 'antd'
import Formsy from 'formsy-react'
import Toggle from './forms/toggle'
import SearchBox from './SearchBox'

type Props = {
  placeholder: string,
  suggestionUrl: string,
  onAdd: Function,
  optionLabel: string,
  optionLabelOn: string,
  optionLabelOff: string,
  addButtonLabel: string
}

type Value = {|
  key: string,
  value: string
|}

type State = {
  value?: Value,
  option: boolean
}

export default class AddItem extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      option: false
    }
  }

  searchBox: any

 handleAddWithOptionChecked: ((option: any) => void) = (option: any) => {
   this.setState({option})
 }

 resetSearch: (() => void) = () => {
   this.setState({
     value: undefined,
     option: false
   })
   this.searchBox.reset()
 }

  handleSearch: ((input: string) => void) = (input: string) => {
    if (!input) {
      this.resetSearch()
    } else {
      this.setState({value: {key: input, value: input}})
    }
  }

 submit: ((e: any) => void) = (e: any) => {
   e.preventDefault()
   if (!this.state.value) return
   this.props.onAdd({value: this.state.value, option: this.state.option})
   // reset form
   this.resetSearch()
 }

 render (): Node {
   const { suggestionUrl, placeholder, optionLabel, optionLabelOn, optionLabelOff, addButtonLabel } = this.props

   return (
     <>
       <Row justify='center' align='middle' style={{marginBottom: '20px'}}>
         <SearchBox
           ref={el => { this.searchBox = el }}
           label={placeholder}
           suggestionUrl={suggestionUrl}
           onSearch={this.handleSearch}
           onReset={this.resetSearch}
         />
       </Row>

       <Row justify='center' align='middle'>
         <Col span={12}>
           <Formsy>
             <Toggle
               name='admin' onChange={this.handleAddWithOptionChecked} labelOff={optionLabelOff} labelOn={optionLabelOn} checked={this.state.option}
               tooltipPosition='top' tooltip={optionLabel}
             />
           </Formsy>
         </Col>

         <Col span={12} style={{textAlign: 'right'}}>
           <Button type='primary' onClick={this.submit}>{addButtonLabel}</Button>
         </Col>
       </Row>
     </>
   )
 }
}
