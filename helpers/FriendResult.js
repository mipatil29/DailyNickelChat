module.exports = function(async, Users, Message){
    
    return{
        
        PostRequest: function(req, res, url){
            
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
                // res.redirect('/group/'+req.params.name);
                res.redirect(url);
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
                },
                
                function(callback){
                    
                    if(req.body.chatId){
                        Message.update({
                            '_id': req.body.chatId
                        }, 
                        {
                            "isRead": true
                        }, (err, done) => {
                            console.log(done);
                            callback(err, done);
                        })
                    }
                }
                
            ]);
            
            
        }
    }
}