import Reflux from 'reflux';
import Locales  from '../services/locales';
import LocaleStore from '../stores/LocaleStore';
export default class MapHubsComponent extends Reflux.PureComponent {

   constructor(props){
		super(props);
    this.stores = [LocaleStore];
	}

  componentWillMount(){
     super.componentWillMount();
  }


  __(text){
    if(this.state.locale){
      return Locales.getLocaleString(this.state.locale, text);
    }else{
      return text;
    }
    
  }
}