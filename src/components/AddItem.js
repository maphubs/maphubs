// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import Formsy from 'formsy-react'
import Toggle from './forms/toggle'
import MessageActions from '../actions/MessageActions'
import Suggestions from './SearchBar/Suggestions'
import MapHubsComponent from './MapHubsComponent'
import LocaleStore from '../stores/LocaleStore'

const $ = require('jquery')

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
  addButtonLabel: string
}

type DefaultProps = {
  id: string,
  autoFocus: boolean,
  autosuggestDelay: number,
  inputName: string,
  placeholder: string,
  addButtonLabel: string
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

export default class AddItem extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps: DefaultProps = {
    id: 'additem',
    autoFocus: false,
    autosuggestDelay: 250,
    inputName: 'query',
    placeholder: 'Add',
    addButtonLabel: 'Add'
  }

  state: State

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
    /* eslint-disable react/no-find-dom-node */
    if (this.props.autoFocus) {
      const domNode = ReactDOM.findDOMNode(this.refs.value)
      if (domNode) {
        domNode.focus()
      }
    }

    $(ReactDOM.findDOMNode(this.refs.suggestions)).dropdown({
      inDuration: 300,
      outDuration: 225,
      constrainWidth: true, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: true // Displays dropdown below the button
    })
    $(document.body).on('click', this.hideSuggestions)
  /* eslint-enable react/no-find-dom-node */
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
   // findDOMNode needed here, possible due to the way suggestions are added dynamicallly below
   /* eslint-disable react/no-find-dom-node */
   $(ReactDOM.findDOMNode(this.refs.suggestions)).show()
   /* eslint-enable react/no-find-dom-node  */
 }

 hideSuggestions = () => {
   /* eslint-disable react/no-find-dom-node */
   $(ReactDOM.findDOMNode(this.refs.suggestions)).hide()
   /* eslint-enable react/no-find-dom-node */
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
               data-activates={this.refs.suggestions}
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
           <Toggle name='admin' onChange={this.handleAddWithOptionChecked} labelOff={this.__('Member')} labelOn={this.__('Administrator')} checked={this.state.option}
             dataPosition='top' dataTooltip={this.props.optionLabel}
           />
         </Formsy>

         <a className='btn waves-effect waves-light right' onClick={this.submit}>{this.props.addButtonLabel}</a>

       </div>
       <div className='row no-margin'>
         {!!this.state.suggestions.length &&
         <Suggestions
           ref='suggestions'
           suggestions={this.state.suggestions}
           highlightedItem={this.state.highlightedItem}
           onSelection={this.fillInSuggestion} />}
       </div>
     </div>
   )
 }
}
