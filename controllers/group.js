module.exports = function(Users, async){
    return {
    
        SetRouting: function(router){
            router.get('/group/:name', this.groupPage);
            
            
            // // For Friend Request
            router.post('/group/:name', this.groupPostPage);
            
            
             //Logout Functionality
            router.get('/logout', this.logout);
        },

        
        groupPage: function(req, res) {
            const name = req.params.name;
            
            //res.render('groupchat/group', {title: 'Daily Nickel Chat - Group', user:req.user, groupName:name }); -- Commenting this line to implement the friend Functionality
            
            // For Friend Request
            async.parallel([
                 
                function(callback){
                    
                    Users.findOne({'username': req.user.username})
                        .populate('request.userId')
                        .exec((err, result) => {
                            callback(err, result);
                        })
                }
                
            ], (err, results) => {
                    
                const result1 = results[0];
                //console.log(result1);
                
                res.render('groupchat/group', {title: 'Daily Nickel Chat - Group', user:req.user, groupName:name, data: result1 });
                
            });
            // For Friend Request
            /**/
            
            //res.render('groupchat/group', {title: 'Daily Nickel Chat - Group', user:req.user, groupName:name });
            //res.render('groupchat/group', {title: 'Daily Nickel Chat - Group', user:req.user, groupName:name, data: result1, chat:result2, groupMsg: result3});
        },

        
        // For Friend Request
        groupPostPage: function(req, res){
            //FriendResult.PostRequest(req, res, '/group/'+req.params.name);
            
            async.parallel([
                
                function(callback){
                    
                    if(req.body.receiverName){
                        
                        Users.update({
                            'username': req.body.receiverName,
                            'request.userId': {$ne: req.user._id},
                            'friendsList.friendId': {$ne: req.user._id}
                        },
                        {
                            $push: {request:{
                                userId: req.user._id,
                                username: req.user.username
                            }},
                            $inc: {totalRequest: 1}
                            
                        }, (err, count) => {
                            callback(err, count);   
                        });
                    }
                },
                
                function(callback){
                    
                    if(req.body.receiverName){
                        
                        Users.update({
                            'username': req.user.username, 
                            'sentRequest.username': {$ne: req.body.receiverName}
                        },
                        {
                            $push: { sentRequest:{
                                username: req.body.receiverName
                            }}
                        
                        }, (err, count) => {
                            callback(err, count);   
                        });
                    }
                }
                
            ], (err, results) => {
                res.redirect('/group/'+req.params.name);
            });
            
            
            
            
            async.parallel([
                
                function(callback){
                    
                    if(req.body.senderId){
                        
                        Users.update({
                            '_id': req.user._id,
                            'friendsList.friendId': {$ne: req.body.senderId}
                        },
                        {
                            $push: {friendsList:{
                                friendId: req.body.senderId,
                                friendName: req.body.senderName
                            }},
                            
                            $pull: {request:{
                                userId: req.body.senderId,
                                username: req.body.senderName
                            }},
                            
                            $inc: {totalRequest: -1}
                            
                        }, (err, count) => {
                            callback(err, count);   
                        });
                    }
                },
                
                function(callback){
                    
                    if(req.body.senderId){
                        
                        Users.update({
                            '_id': req.body.senderId,
                            'friendsList.friendId': {$ne: req.user._id}
                        },
                        {
                            $push: {friendsList:{
                                friendId: req.user._id,
                                friendName: req.user.username
                            }},
                            
                            $pull: {sentRequest:{
                                username: req.user.username
                            }},
                            
                        }, (err, count) => {
                            callback(err, count);   
                        });
                    }
                },
                
                function(callback){
                    
                     if(req.body.user_Id){
                         
                         Users.update({
                            '_id': req.user._id,
                            'request.userId': {$ne: req.body.user_Id}
                        },
                        {
                            $pull: {request:{
                                userId: req.body.user_Id
                            }},
                            
                             $inc: {totalRequest: -1}
                             
                        }, (err, count) => {
                            callback(err, count);   
                        })
                     }
                },
                
                
                function(callback){
                    
                     if(req.body.user_Id){
                         
                        Users.update({
                            '_id': req.body.user_Id,
                            'sentRequest.username': {$ne: req.user.username}
                        },
                        {
                            $pull: {sentRequest:{
                                username: req.user.username
                            }}
                             
                        }, (err, count) => {
                            callback(err, count);   
                        })
                     }
                }
                
                
            ]);
        },
        // For Friend Request
        
        logout: function(req, res){
            req.logout();
            req.session.destroy((err) => {
               res.redirect('/');
            });
        }
    }
}





/*
module.exports = function(Users, async, Message, FriendResult, Group){
    return {
        SetRouting: function(router){
            router.get('/group/:name', this.groupPage);
            router.post('/group/:name', this.groupPostPage);
            
            router.get('/logout', this.logout);
        },
        
        groupPage: function(req, res){
            const name = req.params.name;
            
            async.parallel([
                function(callback){
                    Users.findOne({'username': req.user.username})
                        .populate('request.userId')
                        
                        .exec((err, result) => {
                            callback(err, result);
                        })
                },
                
                function(callback){
                    const nameRegex = new RegExp("^" + req.user.username.toLowerCase(), "i")
                    Message.aggregate(
                        {$match:{$or:[{"senderName":nameRegex}, {"receiverName":nameRegex}]}},
                        {$sort:{"createdAt":-1}},
                        {
                            $group:{"_id":{
                            "last_message_between":{
                                $cond:[
                                    {
                                        $gt:[
                                        {$substr:["$senderName",0,1]},
                                        {$substr:["$receiverName",0,1]}]
                                    },
                                    {$concat:["$senderName"," and ","$receiverName"]},
                                    {$concat:["$receiverName"," and ","$senderName"]}
                                ]
                            }
                            }, "body": {$first:"$$ROOT"}
                            }
                        }, function(err, newResult){
                            const arr = [
                                {path: 'body.sender', model: 'User'},
                                {path: 'body.receiver', model: 'User'}
                            ];
                            
                            Message.populate(newResult, arr, (err, newResult1) => {
                                callback(err, newResult1);
                            });
                        }
                    )
                },
                
                function(callback){
                    Group.find({})
                         .populate('sender')
                         .exec((err, result) => {
                            callback(err, result)
                         });
                }
            ], (err, results) => {
                const result1 = results[0];
                const result2 = results[1];
                const result3 = results[2];
                
                res.render('groupchat/group', {title: 'Footballkik - Group', user:req.user, groupName:name, data: result1, chat:result2, groupMsg: result3});
            });
        },
        
        groupPostPage: function(req, res){
            FriendResult.PostRequest(req, res, '/group/'+req.params.name);
            
            async.parallel([
                function(callback){
                    if(req.body.message){
                        const group = new Group();
                        group.sender = req.user._id;
                        group.body = req.body.message;
                        group.name = req.body.groupName;
                        group.createdAt = new Date();
                        
                        group.save((err, msg) => {
                            callback(err, msg);
                        });
                    }
                }
            ], (err, results) => {
                res.redirect('/group/'+req.params.name);
            });
        },
        
        logout: function(req, res){
            req.logout();
            req.session.destroy((err) => {
               res.redirect('/');
            });
        }
    }
}
*/