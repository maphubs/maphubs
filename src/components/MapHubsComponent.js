import Reflux from 'reflux';
import Locales  from '../services/locales';
import LocaleStore from '../stores/LocaleStore';
//import LocaleActions from '../actions/LocaleActions';
//import Rehydrate from 'reflux-rehydrate';
//import debugFactory from '../services/debug';
//let debug = debugFactory('MapHubsComponent');

export default class MapHubsComponent extends Reflux.Component {

   constructor(props){
		super(props);
    this.stores = [LocaleStore];    
	}

  componentWillMount(){
     super.componentWillMount();
  }

  __ = (text) => {
    if(this.state.locale){
      return Locales.getLocaleString(this.state.locale, text);
    }else{
      return text;
    }
  }
}