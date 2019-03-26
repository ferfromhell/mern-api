const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const validateProfileInput = require('../../validation/profile');

router.get('/test', (req,res) => {
  res.json({
    msg: "Profile"
  })
});

//Get current user profile
router.get('/', passport.authenticate('jwt',{ session:false }), (req,res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile){
        errors.noprofile = "No profile found"
        return res.status(400).json(errors)
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});
//Get all profiles
router.get('/all', (req, res) => {
  const errors = {};

  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = 'There are no profiles';
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: 'There are no profiles' }));
});

//Get profile by handle (nickname)
router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

//Get profile by user id
router.get('/user/:user_id', (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: 'There is no profile for this user' })
    );
});

//Create profile
router.post('/', passport.authenticate('jwt', { session: false }), (req,res) => {
  // console.log(req.body);
  const {errors, isValid} = validateProfileInput(req.body);
  if(!isValid) return res.status(400).json(errors);

  const profileFields = {};
  profileFields.user = req.user.id;
  if(req.body.handle) profileFields.handle = req.body.handle;
  if(req.body.company) profileFields.company = req.body.company;
  if(req.body.website) profileFields.website = req.body.website;
  if(req.body.location) profileFields.location = req.body.location;
  // if(req.body.status) profileFields.status = req.body.status;
  // if(req.body.bio) profileFields.status = req.body.bio;
  
  if(typeof req.body.skills !== 'undefined'){
    profileFields.skills = req.body.skills.split(',');
  }

  // if(req.body.skills) profileFields.skills = req.body.skills;
  if(req.body.bio) profileFields.bio = req.body.bio;
  // if(req.body.status) profileFields.status = req.body.status;

  Profile.findOne({ user: req.user.id })
  .then(profile => {
    if(profile){
      //Update
      Profile.findOneAndUpdate(
        { user: req.user.id }, 
        { $set: profileFields }, 
        { new:true })
        .then(profile => res.json(profile))
    }else{
      //create
      Profile.findOne({ handle: profileFields.handle })
      .then(profile => {
        if(profile){
          errors.handle = "That handle already exists";
          res.status(400).json(errors);
        }
        //Save the prfile
        new Profile(profileFields).save().then(profile => res.json(profile));
      })
    }
  })

});

//Delete profile and user
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);


module.exports = router;