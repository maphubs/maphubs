//@flow
import React from 'react';

export default class SubPageBanner extends React.Component {

props: {
  title: string,
  subTitle: string,
  img: string,
  backgroundPosition: string,
  locale: string,
}

static defaultProps = {
  backgroundPosition: 'center'
}

render(){
  return (
    <div className="responsive-img"
        style={{
          height: '250px',
          backgroundSize: 'cover',
          backgroundPosition: this.props.backgroundPosition,
          backgroundImage: 'url('+ this.props.img + ')'
        }}>
        <div className="valign-wrapper"
          style={{
            position: 'absolute',
            width: '100%',
            height: '250px',
            backgroundColor: 'rgba(0,0,0,0.55)'
          }}>
          <div className="container valign">
            <h4 lang={this.props.locale} style={{color: 'rgba(255,255,255,0.9)'}}>{this.props.title}</h4>
            <p lang={this.props.locale} className="flow-text" style={{color: 'rgba(255,255,255,0.9)'}}>{this.props.subTitle}</p>
              <div className="row center center-align">
                <a className="btn waves-effect" style={{borderRadius: '25px'}} lang="en" onClick={function(){HS.beacon.open();}} href="#">Contact Us</a>
              </div>
          </div>

        </div>
    </div>
  );
}
}