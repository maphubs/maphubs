// @flow
//var debug = require('../../services/debug')('routes/stories');
const login = require('connect-ensure-login');
const User = require('../../models/user');
const Story = require('../../models/story');
const Stats = require('../../models/stats');
const Map = require('../../models/map');
const nextError = require('../../services/error-response').nextError;
const apiDataError = require('../../services/error-response').apiDataError;
const csrfProtection = require('csurf')({cookie: false});
const urlUtil = require('../../services/url-util');

module.exports = function(app: any) {

  //Views
  app.get('/stories', async (req, res, next) => {
    try{
      return res.render('stories', {
        title: req.__('Stories') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          popularStories: await Story.getPopularStories(10),
          recentStories: await Story.getRecentStories(10)
        }, req
      });
    }catch(err){nextError(next)(err);}
  });

  app.get('/stories/all', async (req, res, next) => {
    try{   
      return res.render('allstories', {
        title: req.__('Stories') + ' - ' + MAPHUBS_CONFIG.productName,
        props: {
          stories: await Story.getAllStories().orderBy('omh.stories.title')
        }, req
      });
    }catch(err){nextError(next)(err);}
  });

  app.get('/user/:username/stories', (req, res, next) => {

    const username: string = req.params.username;
    if(!username){apiDataError(res);}
    let myStories: boolean = false;

    function completeRequest(){

      User.getUserByName(username)
      .then((user) => {
        if(user){
          return Story.getUserStories(user.id, myStories)
          .then((stories) => {
            return res.render('userstories', {
              title: 'Stories - ' + username,
              props:{user, stories, myStories, username}, 
              req
            });
          });
        }else{
          return res.redirect('/notfound?path='+req.path);
        }
      }).catch(nextError(next));
    }

    if (!req.isAuthenticated || !req.isAuthenticated()
        || !req.session || !req.session.user) {
          completeRequest();
    } else {
      //get user id
      const user_id = req.session.user.maphubsUser.id;

      //get user for logged in user
      User.getUser(user_id)
      .then((user) => {
        //flag if requested user is logged in user
        if(user.display_name === username){
          myStories = true;
        }
        return completeRequest();       
      }).catch(nextError(next));
    }
  });

  app.get('/user/createstory', login.ensureLoggedIn(), csrfProtection, async (req, res, next) => {
    try{
      const username = req.session.user.maphubsUser.display_name;
      const user_id = req.session.user.maphubsUser.id;
      const story_id = await Story.createUserStory(user_id);

      return res.render('createuserstory', {
        title: 'Create Story',
        fontawesome: true,
        rangy: true,
        props: {
          username, 
          myMaps: await Map.getUserMaps(req.session.user.maphubsUser.id), 
          popularMaps: await Map.getPopularMaps(), 
          story_id
        }, req
      });
    }catch(err){nextError(next)(err);}
  });

  app.get('/user/:username/story/:story_id/edit/*', login.ensureLoggedIn(), csrfProtection, async (req, res, next) => {
    try{
      const username = req.params.username;
      const user_id = req.session.user.maphubsUser.id;
      const story_id = parseInt(req.params.story_id || '', 10);

      if(await Story.allowedToModify(story_id, user_id)){
        const story = await Story.getStoryByID(story_id);

        return res.render('edituserstory', {
          title: 'Editing: ' + story.title,
          fontawesome: true,
          rangy: true,
          props: {
            story, 
            myMaps: await Map.getUserMaps(user_id), 
            popularMaps: await Map.getPopularMaps(), 
            username
          }, req
        });
      }else{
        return res.redirect('/unauthorized');
      }
    }catch(err){nextError(next)(err);}
  });

  app.get('/user/:username/story/:story_id/*', (req, res, next) => {

    const story_id = parseInt(req.params.story_id || '', 10);
    const username = req.params.username;

      let user_id = -1;
      if ( (req.isAuthenticated || req.isAuthenticated())
          && req.session && req.session.user) {
            user_id = req.session.user.maphubsUser.id;
      }
    Story.getStoryByID(story_id)
      .then((story) => {
        if(!story){
          return res.redirect('/notfound?path='+req.path);
        }

        if(!req.session.storyviews){
          req.session.storyviews = {};
        }
        if(!req.session.storyviews[story_id]){
          req.session.storyviews[story_id] = 1;
          Stats.addStoryView(story_id, user_id).catch(nextError(next));
        }else{
          const views = req.session.storyviews[story_id];

          req.session.storyviews[story_id] = views + 1;
        }

        req.session.views = (req.session.views || 0) + 1;

        if (user_id === -1) { //don't check permissions if user is not logged in
             let imageUrl = '';
            if(story.firstimage){
              imageUrl = urlUtil.getBaseUrl() + story.firstimage;
            }
            let description = story.title;
            if(story.firstline){
              description = story.firstline;
            }
            if(!story.published){
              //guest users never see draft stories
              return res.status(401).send("Unauthorized");
            }else{
              return res.render('userstory', {
              title: story.title,
              description,
              props: {
                story, username, canEdit: false
              },
              talkComments: true,
              twitterCard: {
                title: story.title,
                description,
                image: imageUrl,
                imageType: 'image/jpeg'
              },
              req
            });
            }          
      } else {
        return Story.allowedToModify(story_id, user_id)
        .then((canEdit) => {       
           let imageUrl = '';
            if(story.firstimage){
              imageUrl = story.firstimage;
            }
           let description = story.title;
            if(story.firstline){
              description = story.firstline;
            }

          if(!story.published && !canEdit){
              return res.status(401).send("Unauthorized");
            }else{
              return res.render('userstory', {
                title: story.title,
                description,
                props: {
                  story, username, canEdit
                },
                talkComments: true,
                twitterCard: {
                    title: story.title,
                    description,
                    image: imageUrl,
                    imageType: 'image/jpeg'
                }, req
              });
            }
        });
      }
    }).catch(nextError(next));
  });
};