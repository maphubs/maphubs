import React from 'react';
import {
  ShareButtons,
  generateShareIcon,
} from 'react-share';

  const {
    FacebookShareButton,
    TwitterShareButton
  } = ShareButtons;

  const FacebookIcon = generateShareIcon('facebook');
  const TwitterIcon = generateShareIcon('twitter');

type Props = {
  style: Object,
  title: string,
  url: string,
  photoUrl: string,
  iconSize: number
}

type State = {
  url: string
}

export default class MapHubsShareButtons extends React.Component<void, Props, State> {

  props: Props

  static defaultProps = {
    iconSize: 32,
    style: {}
  }

  state: State

  constructor(props: Props){
    super(props);
    this.state = {
      url: props.url ? props.url : ''
    };
  }

  componentDidMount(){
    if(!this.props.url){
      this.setState({url: window.location.href});
    }
 
  }

  render(){

    return (
      <div style={this.props.style}>
        <div style={{float: 'left'}}>
           <FacebookShareButton
            url={this.state.url}
            title={this.props.title}
            picture={this.props.photoUrl}
            >
            <FacebookIcon
              size={this.props.iconSize}
              round />
          </FacebookShareButton>
        </div>
        <div style={{float: 'right', marginLeft: '3px'}}>
           <TwitterShareButton
            url={this.state.url}
            title={this.props.title}
            >
            <TwitterIcon
              size={this.props.iconSize}
              round />
          </TwitterShareButton>
        </div>
       
          
      </div>
    );
  
  }
}
