'use strict';

const _ = require('lodash');
const passport = require('passport');

module.exports = function(_){

    return {
        SetRouting: function(router){
            router.get('/', this.indexPage);
            router.get('/signup', this.getSignUp);
            router.get('/home', this.homePage);
            
            
            router.post('/signup', this.postSignUp);
        },
        
        indexPage: function(req, res){
            //console.log('Hello');
            return res.render('index', {test : 'This is a test'});
        },
        
        getSignUp: function(req,res){
           return res.render('signup'); 
        },
        
        postSignUp: passport.authenticate('local.signup', {
           successRedirect: '/home',
           failureRedirect: '/signup',    
           failureFlash: true
            
        }),
        
        homePage: function(req,res){
            return res.render('home');
        }
        
    }
}