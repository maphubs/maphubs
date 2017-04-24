import Reflux from 'reflux';

Reflux.rehydrate = (str, data) => {
    return Reflux.initStore(str).setState(data);
};

export default Reflux;

export function initStore(str) {
  str.prototype.rehydrate = function(state){
    this.setState(state);
  };
  return Reflux.initStore(str);
}

 export function createActions(actions){
  let rehydrateActions = ['rehydrate'];
  actions = rehydrateActions.concat(actions);
  return Reflux.createActions(actions);
} 
