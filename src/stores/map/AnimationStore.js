import Reflux from 'reflux';
import Actions from '../../actions/map/AnimationActions';
var debug = require('../../services/debug')('stores/AnimationStore');

/**
 * A store to hold marker objects so we can update them later
 */
export default class AnimationStore extends Reflux.Store {

  constructor(){
    super();
    this.state = {
      playing: false,
      startVal: 2001,
      endVal: 2014,
      currentVal: 2001,
      tickLength: 1,
      tickTime: 3000,
      loop: true
    };
    this.listenables = Actions;
  }

  storeDidUpdate(){
    debug('store updated');
  }

  play(){
    debug('play');
    var _this = this;
    if(this.state.playing){
      //already playing
       debug('already playing');
      return;
    }
    _this.setState({playing: true});
    _this.runTick();
  }

  runTick(){
    var _this = this;
    if(this.state.playing){
      debug('tick: ' + _this.state.currentVal);
      Actions.tick(_this.state.currentVal);
      //schedule next tick    
      setTimeout(()=>{
          if(_this.state.currentVal < _this.state.endVal){
            _this.state.currentVal = _this.state.currentVal + 1;
          }else{
            if(_this.state.loop){
              _this.state.currentVal = _this.state.startVal;
            }else{
              _this.stop();
            } 
          }
          _this.runTick();

        }, _this.state.tickTime);
    }
  }

  stop(){
     debug('stop');
    this.setState({playing: false});
  }

  reset(){
     debug('reset');
    this.setState({
      playing: false,
      currentVal: this.state.startVal
    });
  }
}