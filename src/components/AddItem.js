// @flow
import React from 'react'
import Formsy from 'formsy-react'
import Toggle from './forms/toggle'
import MessageActions from '../actions/MessageActions'
import Suggestions from './SearchBar/Suggestions'
import LocaleStore from '../stores/LocaleStore'

import $ from 'jquery'

const KEY_CODES = {
  UP: 38,
  DOWN: 40,
  ENTER: 13
}

type Props = {
  id: string,
  placeholder: string,
  suggestionUrl: string,
  onAdd: Function,
  autosuggestDelay: number,
  autoFocus: boolean,
  inputName: string,
  optionLabel: string,
  addButtonLabel: string,
  t: Function
}

type Value = {|
  key: string,
  value: string
|}

type State = {
  value?: Value,
  suggestions: Array<string>,
  highlightedItem: number,
  option: boolean
}

export default class AddItem extends React.Component<Props, State> {
  static defaultProps = {
    id: 'additem',
    autoFocus: false,
    autosuggestDelay: 250,
    inputName: 'query',
    placeholder: 'Add',
    addButtonLabel: 'Add'
  }

  _timerId: any

  constructor (props: Props) {
    super(props)
    this.stores = [LocaleStore]
    this.state = {
      suggestions: [],
      highlightedItem: -1,
      option: false
    }
  }

  componentDidMount () {
    if (this.props.autoFocus) {
      if (this.refs.value) {
        this.refs.value.focus()
      }
    }
    $(document.body).on('click', this.hideSuggestions)
  }

  componentWillUnmount () {
    if (document && document.body) {
      document.body.removeEventListener('click', this.hideSuggestions)
    }
  }

 updateSuggestions = (input: string, cb: Function) => {
   if (typeof window !== 'undefined' && this.props.suggestionUrl) {
     $.ajax({
       url: this.props.suggestionUrl + '?q=' + input,
       contentType: 'application/json;charset=UTF-8',
       dataType: 'json',
       async: true,
       success (msg) {
         if (msg.suggestions) {
           cb(msg.suggestions)
         }
       },
       error (msg) {
         MessageActions.showMessage({title: 'Error', message: msg})
       },
       complete () {
       }
     })
   }
 }

 handleAddWithOptionChecked = (option: any) => {
   this.setState({option})
 }

 handleClick = (e: any) => {
   e.nativeEvent.stopImmediatePropagation()
 }

 handleKeyDown = (e: any) => {
   if (e.which === KEY_CODES.ENTER) {
     e.preventDefault()
     this.submit(e)
   }
   if (e.which !== KEY_CODES.UP && e.which !== KEY_CODES.DOWN) return
   e.preventDefault()
   let highlightedItem = this.state.highlightedItem

   if (e.which === KEY_CODES.UP) {
     if (highlightedItem <= 0) return
     --highlightedItem
   }
   if (e.which === KEY_CODES.DOWN) {
     if (highlightedItem === this.state.suggestions.length - 1) return
     ++highlightedItem
   }

   this.setState({
     highlightedItem,
     value: this.state.suggestions[highlightedItem]
   })
 }

 displaySuggestions = (suggestions: Array<string>) => {
   this.setState({
     suggestions,
     highlightedItem: -1
   })
   if (this.suggestions) {
     this.suggestions.show()
   }
 }

 hideSuggestions = () => {
   if (this.suggestions) {
     this.suggestions.hide()
   }
 }

 fillInSuggestion = (suggestion: Value) => {
   this.setState({value: suggestion})
 }

 handleChange = (e: any) => {
   clearTimeout(this._timerId)
   const input = e.target.value
   if (!input) {
     return this.setState({
       value: {key: input, value: input},
       suggestions: [],
       highlightedItem: -1,
       option: false
     })
   } else {
     this.setState({value: {key: input, value: input}})

     this._timerId = setTimeout(() => {
       this.updateSuggestions(input, (suggestions) => {
         if (!this.state.value) return
         this.displaySuggestions(suggestions)
       })
     }, this.props.autosuggestDelay)
   }
 }

 submit = (e: any) => {
   e.preventDefault()
   if (!this.state.value) return
   this.props.onAdd({value: this.state.value, option: this.state.option})
   // reset form
   this.setState({
     suggestions: [],
     highlightedItem: -1,
     option: false
   })
 }

 render () {
   const {t} = this.props
   let value
   if (this.state.value && this.state.value.value) {
     value = this.state.value.value
   }
   return (
     <div>
       <div className='white no-margin'
         style={{
           borderRadius: '25px',
           border: '1px solid #212121',
           boxSizing: 'content-box',
           height: '2.2pc',
           lineHeight: '2.2pc'
         }}
       >
         <form>
           <div className='input-field no-margin' style={{position: 'relative'}}>
             <input id={this.props.id}
               type='search'
               style={{
                 margin: 0,
                 border: 'none',
                 color: '#212121',
                 height: '2.2pc',
                 lineHeight: '2.2pc',
                 fontSize: '1rem',
                 background: 'transparent'
               }}
               name={this.props.inputName}
               maxLength='100'
               autoComplete='off'
               ref='value'
               value={value}
               placeholder={this.props.placeholder}
               onChange={this.handleChange}
               onKeyDown={this.handleKeyDown}
               onClick={this.handleClick}
               data-beloworigin='true'
               data-activates={this.suggestions}
               required />

             <label htmlFor={this.props.id}
               style={{
                 height: 'inherit',
                 lineHeight: 'inherit',
                 position: 'absolute',
                 top: '0px',
                 left: '0px',
                 marginLeft: '5px',
                 marginRight: '5px',
                 transform: 'inherit'}}
             >
               <i className='material-icons' style={{height: 'inherit', lineHeight: 'inherit'}}>search</i></label>
           </div>
         </form>
         <Formsy >
           <Toggle name='admin' onChange={this.handleAddWithOptionChecked} labelOff={t('Member')} labelOn={t('Administrator')} checked={this.state.option}
             dataPosition='top' dataTooltip={this.props.optionLabel}
           />
         </Formsy>

         <a className='btn waves-effect waves-light right' onClick={this.submit}>{this.props.addButtonLabel}</a>

       </div>
       <div className='row no-margin'>
         {!!this.state.suggestions.length &&
         <Suggestions
           ref={(el) => { this.suggestions = el }}
           suggestions={this.state.suggestions}
           highlightedItem={this.state.highlightedItem}
           onSelection={this.fillInSuggestion} />}
       </div>
     </div>
   )
 }
}
