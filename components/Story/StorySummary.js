var React = require('react');
var slug = require('slug');

var StorySummary = React.createClass({

  propTypes: {
    story: React.PropTypes.object.isRequired,
    baseUrl: React.PropTypes.string
  },

  getDefaultProps(){
    return {
      baseUrl: ''
    }
  },


  render(){

    var image = '';
    if(this.props.story.firstimage){
      image = (
        <div>
          <a href={this.props.baseUrl + '/story/' + this.props.story.story_id + '/' + slug(this.props.story.title)}>
          <img className="responsive-img" style={{height: '180px', width: '100%', objectFit: 'cover'}} src={this.props.story.firstimage} />
          </a>
        </div>
      );
    }

   return (
     <div>
       <a href={this.props.baseUrl + '/story/' + this.props.story.story_id + '/' + slug(this.props.story.title)}>
         <h5 className="grey-text text-darken-4 story-title">{this.props.story.title}</h5>
       </a>
       {image}
       <div className="story-content">
         <p>
           {this.props.story.firstline}
         </p>
       </div>
     </div>
   );
  }

});

module.exports = StorySummary;
