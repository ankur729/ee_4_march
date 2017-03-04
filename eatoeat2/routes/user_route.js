
var express=require('express');

var router=express.Router();
var mongojs=require('mongojs');
var bcrypt=require('bcrypt-nodejs');
var db=mongojs('mongodb://admin:root@ds127399.mlab.com:27399/eatoeat');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var fs=require('fs');
var dns=require('dns');
var os=require('os');
// var util=require('util');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ankuridigitie@gmail.com',
        pass: 'idigitieankur'
    }
});

// setup email data with unicode symbols

router

.post('/add-user-info',function(req,res,next){

// res.send('Task API');
        // res.writeHead(302, {'Location': 'http://192.168.1.101:3000/#/user_login'});
        // res.end();
        
    db.user_infos.find({email : req.body.user_email}, function (err,user_details) {
     
        if (user_details !=""){
            
            res.status(409);
            console.log('email already registered');
        res.json({'error':'Email Already Registered'});

        }else  if (user_details ==""){
          
           db.user_infos.save({
                    username:req.body.user_name,
                    email:req.body.user_email,
                    phone:req.body.user_contact_no,
                    password:bcrypt.hashSync(req.body.user_password,bcrypt.genSaltSync(10)),
                    isVerified:"false",
                    status:"active",
              
                    
                    },function(err,user){

                          if(err) throw err;
                           
                              var mailOptions = {
                                    from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                                    to: req.body.user_email, // list of receivers
                                    subject: 'Welcome To EatoEato ', // Subject line
                                    text: 'Please Activate Your EatoEato Account', // plain text body
                                    html: '<b>Your Account Has Been Created by, Please Click on Below Link to Verify your Account</b> <br> <a href="http://192.168.1.157:3000/#/verify-user-params/'+user._id+'">'+randomValueHex(100)+'</a>' // html body
                                };

                                        transporter.sendMail(mailOptions, function(error, info){
                                        if(error){
                                            console.log(error);
                                            res.json({yo: 'error'});
                                        }else{
                                            console.log('Message sent: ' + info.response);
                                           
                                        };
                                    });
                            
                         res.send(user);
                        console.log(user._id);

                  })
            
           
        }
    });



});

router

.get('/user-verify/:user_id',function(req,res,next){
// console.log(req.params['user_id']);
// res.send('Task API');
        // res.writeHead(302, {'Location': 'http://192.168.1.101:3000/#/user_login'});
        // res.end();
      db.user_infos.findAndModify({
                query: { _id: mongojs.ObjectId(req.params['user_id']) },
                update: { $set: { 
                                isVerified:"true"
                               
                     } },
                new: true
            }, function (err, user, lastErrorObject) {
                if(err){
                        res.status(400);
                        res.send('error');
                         throw err;

                        }    
    
                         res.status(200);
                         res.send(user);
                        console.log('user Verified');
            });
});


router

.post('/user-login',function(req,res,next){

// res.send('Task API');
//  console.log(req.body);
db.user_infos.find(
                { 
              
                    email:req.body.email,
                    isVerified:"true"     
                }
                ,function(err,user){

                        
                 if(err || user=="")
                 {  
                      res.status(404);
                      res.send('Either Bad Credential Or Not Activated Yet');
                 }else {

                      if(bcrypt.compareSync(req.body.password,user[0].password))
                 {
                     
                      if(user[0].status=="inactive"){
                                res.status(200).send('account disabled');
                                console.log('user is inactive');
                        }
                        else{
                            console.log(user);
                             res.status(200).send(user);
              
                        }

                 
                 
                 }
                 else
                 {
                     res.status(401).json('unauthorized');
                    
                 }
                     
                 }
        });


});


router

.post('/user-pass-update',function(req,res,next){

 
  console.log(req.body);
var flag=false;
    db.user_infos.find(
                    { 
                        _id: mongojs.ObjectId(req.body.user_id)                    
                    }
                    ,function(err,user){

                    if(err || user=="")
                    {  

                        console.log(err);
                        res.status(404);
                        res.send('user not find');
                    }else {

                         if(bcrypt.compareSync(req.body.old_pass,user[0].password))
                                 
                                    {
                                  
                                        db.user_infos.findAndModify({
                                                    query: { _id: mongojs.ObjectId(req.body.user_id) },
                                                    update: { $set: { 
                                                    
                                                                    password:bcrypt.hashSync(req.body.new_pass,bcrypt.genSaltSync(10))
                                                        } },
                                                    new: true
                                                }, function (err, data, lastErrorObject) {
                                                    if(err){
                                                           
                                                           flag=false;

                                                            }    
                                                            res.status(200);
                                                            res.send(data);
                                                            flag=true;
                                                            console.log('User password UPDATED');
                                                })


                                    }
                                    else
                                    {
                                        if(flag){
                                            console.log('pass updated');
                                        }
                                        else  if(!flag){
                                             res.status(400).send('err');
                                            console.log('not match');
                                        }
                                        // res.status(200).send('fine');
                                      
                                        
                                    }


                    }
            });
        
});

router

.post('/user-profile-update',function(req,res,next){

    if(req.body.user_profile_image==''){

          db.user_infos.findAndModify({
                query: { _id: mongojs.ObjectId(req.body.user_id) },
                update: { $set: { 
                    firstname:req.body.firstname,
                    lastname:req.body.lastname,
                    dob:req.body.dob,
                    gender:req.body.gender

                  } },
                new: true
            }, function (err, data, lastErrorObject) {
                if(err){
                        res.status(400);
                        res.send('error');
                         throw err;

                        }   
                        console.log(data) ;
                        res.status(200);
                         res.send(data);
            });

    }
    else{
dns.lookup(os.hostname(), function (err, add, fam) {
 var date = new Date();
 var food_img=add+':3000/uploads/user_uploads/'+date.getTime()+'.jpg';

           fs.writeFile("client/uploads/user_uploads/"+date.getTime()+".jpg", new Buffer(req.body.user_profile_image, "base64"), function(err) {

                                                                    if (err){

                                                                        throw err;
                                                                        console.log(err);
                                                                        res.send(err)
                                                                    }
                                                                    else{
                                                                           console.log('User image uploaded');
                                                                        // res.send("success");
                                                                        // console.log("success!");
                                                                    }

                                                                });

        db.user_infos.findAndModify({
                query: { _id: mongojs.ObjectId(req.body.user_id) },
                update: { $set: { 
                    firstname:req.body.firstname,
                    lastname:req.body.lastname,
                    dob:req.body.dob,
                    gender:req.body.gender,
                    user_profile_image:food_img
                  } },
                new: true
            }, function (err, data, lastErrorObject) {
                if(err){
                        res.status(400);
                        res.send('error');
                         throw err;

                        }   
                        console.log(data) ;
                        res.status(200);
                         res.send(data);
            });

    });
   

 }


});




router

.post('/user-address-add',function(req,res,next){

  var date = new Date();
var timestamp_var = date.getTime();

         if(req.body.hasOwnProperty('address_default'))
         {  
           
                  db.user_infos.findAndModify(
                    
                    {query:{_id: mongojs.ObjectId(req.body.user_id),
                            'address.address_default':"true"
                    },
                     update: {
                             $set:{'address.$.address_default':'false'}
                            
                         },
                     new:true
                }
                , function (err, data, lastErrorObject) {
                if(err){
                        res.status(400);
                        res.send('error');
                         throw err;
                         
                        }    
                       else{

                                 db.user_infos.findAndModify(
                                                
                                                {query:{_id: mongojs.ObjectId(req.body.user_id)},
                                                update: {
                                                        $push:{'address': {'address_id':timestamp_var,'address_name':req.body.address_name,'address_details':req.body.address_details,'address_locality':req.body.address_locality_landmark,'address_pincode':req.body.address_pincode,'address_state':req.body.address_state,'address_city':req.body.address_city,'address_contact':req.body.address_contact_no,'address_type':req.body.address_type,'address_default':'true'}}
                                                        
                                                    },
                                                new:true
                                            }   
                                            , function (err, data, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                    throw err;

                                                    }    
                                                    res.status(200);
                                                    res.send(data);
                                                    
                                        });



                       }
                                
                       
            });

           
            }

            else
            {

              
                db.user_infos.findAndModify(
                    
                    {query:{_id: mongojs.ObjectId(req.body.user_id)},
                     update: {
                             $push:{'address': {'address_id':timestamp_var,'address_name':req.body.address_name,'address_details':req.body.address_details,'address_locality':req.body.address_locality_landmark,'address_pincode':req.body.address_pincode,'address_state':req.body.address_state,'address_city':req.body.address_city,'address_contact':req.body.address_contact_no,'address_type':req.body.address_type,'address_default':'false'}}
                            
                         },
                     new:true
                }
                , function (err, data, lastErrorObject) {
                if(err){
                        res.status(400);
                        res.send('error');
                         throw err;

                        }    
                        res.status(200);
                         res.send(data);
                      
                       
            });
                
                
            }

});
   

router

.post('/get-user-address',function(req,res,next){

console.log(req.body);

 db.user_infos.find(
                { 
              
                   _id: mongojs.ObjectId(req.body.user_id)
                           
                }
                ,function(err,user){

                        
                 if(err || user=="")
                 {  
                      res.status(404);
                      res.send('user not find');
                 }else {    

                     res.status(200).json(user);

                    console.log(user);
                 }
        });
});


router

.post('/user-account-update',function(req,res,next){

console.log(req.body);
      db.user_infos.findAndModify({
                query: { _id: mongojs.ObjectId(req.body.user_id) },
                update: { $set: { 
                    email:req.body.user_email,
                    phone:req.body.user_mobile,
                     } },
                new: true
            }, function (err, data, lastErrorObject) {
                if(err){
                        res.status(400);
                        res.send('error');
                         throw err;

                        }    
                        res.status(200);
                         res.send(data);
                        console.log('user PROFILE UPDATED');
            })
});

   


router
.post('/user-account-deactivate',function(req,res,next){

console.log(req.body);

    
 db.user_infos.find(
                { 
              
                   _id: mongojs.ObjectId(req.body.user_id),
                    email:req.body.deactivate_user_email,
                    phone:req.body.user_mobile      
                }
                ,function(err,user){

                      
                 if(err || user=="")
                 {  
                      res.status(404);
                      res.status(404).send('details are incorrect');
                 }else {    
                    
                     
                      if(bcrypt.compareSync(req.body.deactivate_user_password,user[0].password))
                     {
                               db.user_infos.findAndModify({
                                        query: { _id: mongojs.ObjectId(req.body.user_id),
                                                
                                                
                                                },
                                        update: { $set: { 

                                                        status:"inactive"
                                            } },
                                        new: true
                                    }, function (err, data, lastErrorObject) {
                                        if(err){
                                                res.status(400);
                                                res.send('error');
                                               
                                                throw err;

                                                }    
                                               
                                                res.status(200).send('acount deactivated');
                                              
                                    });
                                        
                     }
                     else{

                         res.status(404).send('password not match');
                        
                     }
            }

        });

    
});


router
.post('/user-profile-image-upload',function(req,res,next){



// dns.lookup(os.hostname(), function (err, add, fam) {
//   console.log('addr: '+add);
// })

var date = new Date();
var current_hour = date.getTime();

   var user_id=req.body.user_id;

var image_name='192.168.1.157:3000'+'/uploads/'+current_hour+'.jpg';

fs.writeFile("client/uploads/"+current_hour+".jpg", new Buffer(req.body.files, "base64"), function(err) {

    if (err){

        throw err;
    }
    else{
            
             db.user_infos.findAndModify({
                query: { _id: mongojs.ObjectId(req.body.user_id) },
                update: { $set: { 
                    user_profile_image:image_name
          
                     } },
                new: true
            }, function (err, data, lastErrorObject) {
                if(err){
                        res.status(400);
                        res.send('error');
                         throw err;

                        }    
                        res.status(200);
                         res.send('User PROFILE IMAGE UPDATED');
                        console.log('User PROFILE IMAGE UPDATED');
            })
        // res.send("success");
        // console.log("success!");
    }

});

});

//Getting Details for Logged in users

router
.post('/get-user-details',function(req,res,next){

   db.user_infos.find(
                { 
                   _id: mongojs.ObjectId(req.body.user_id),  
                }
                ,function(err,user){
           
                 if(err || user=="")
                 {  
                      res.status(404);
                      res.send('No user Found');
                 }else {

                             console.log(user);
                             res.status(200).send(user[0]);
                     
                 }
        });

});


router
.post('/forget-user-password',function(req,res,next){

console.log(req.body);
   db.user_infos.find(
                { 
                   email : req.body.user_email,
                }
                ,function(err,user){
           
                 if(err || user=="")
                 {  
                      res.status(404);
                      res.send('Email Not Found');
                 }else {
                       
                              var mailOptions = {
                                    from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                                    to: req.body.user_email, // list of receivers
                                    subject: 'EatoEato Password Reset', // Subject line
                                    text: 'Resetting your EatoEato Password', // plain text body
                                    html: '<b> Please Click on Below Link to Reset your Account Password</b> <br><br><br> <a href="http://192.168.1.156:3000/#/user_login'+user._id+'">'+randomValueHex(100)+'</a>' // html body
                                };

                                        transporter.sendMail(mailOptions, function(error, info){
                                        if(error){
                                            console.log(error);
                                            res.json({yo: 'error'});
                                        }else{
                                            console.log('Message sent: ' + info.response);
                                            res.json({'status':'Email Correct','info':'Email Sent'});
                                           
                                        };
                                    });
                            
                        
                     
                  }
        });

});

router
.post('/delete-user-address',function(req,res,next){

console.log(req.body);
                
                db.user_infos.findAndModify({
                                             query:{_id: mongojs.ObjectId(req.body.user_id)},
                                                update: {
                                                        $pull:{'address': {'address_id':req.body.address_id}}
                                                        
                                                    },
                                                new:true
                                            
                                        }, function (err, data, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                     throw err;

                                                    }    
                                                    res.status(200).send(data);
                                                   
                                        });
});


router
.get('/get-listing-foods',function(req,res,next){

console.log('this is for Listing');
var listing = [];
var count=0;
var filter_cuisine=[];
var filter_cuisine_obj=[];

var filter_occ=[];
var filter_occ_obj=[];

var total_cuisine=0;
var total_occ=0;

var filter={};

                db.cook_infos.find({},{ 'food_details':1,_id:0 }, function (err, data, lastErrorObject) {
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                    console.log(err);
                                                    
                                                     throw err;

                                                    }    
                                                    

                                               
                                                    for(var i = 0; i<data.length;i++){

                                                            for(var j=0;j<data[i].food_details.length;j++){



                                                                listing[count]=data[i].food_details[j];
                                                               

                                                                count++;

                                                            }
                                                            
                                                     
                                                    // filter.listing=listing;
                                                    // console.log(listing);
                                                            }
                                                        var c=0;
                                                           for(var i=0;i<listing.length;i++){

                                                                    for(j=0;j<listing[i].cuisine_list.length;j++){

                                                                        if(listing[i].cuisine_list[j].status=='true' && filter_cuisine.indexOf(listing[i].cuisine_list[j].category_name)<0 ){

                                                                                filter_cuisine.push(listing[i].cuisine_list[j].category_name);
                                                                                filter_cuisine_obj[c]=listing[i].cuisine_list[j];
                                                                                c++;
                                                                                // filter.filter_cuisine=filter_cuisine;
                                                                                    //    total_cuisine++;
                                                                                // filter.total_cuisine=total_cuisine;
                                                                                

                                                                               
                                                                        }
                                                                        
                                                                    }
                                                          }

                                                            var o=0;
                                                           for(var i=0;i<listing.length;i++){

                                                                    for(j=0;j<listing[i].occassion_list.length;j++){

                                                                        if(listing[i].occassion_list[j].status=='true' && filter_occ.indexOf(listing[i].occassion_list[j].group_attr)<0 ){

                                                                                filter_occ.push(listing[i].occassion_list[j].group_attr);
                                                                                filter_occ_obj[o]=listing[i].occassion_list[j];
                                                                                o++;
                                                                                // filter.filter_cuisine=filter_cuisine;
                                                                                    //    total_cuisine++;
                                                                                // filter.total_cuisine=total_cuisine;
                                                                                

                                                                               
                                                                        }
                                                                        
                                                                    }
                                                          }
                                      
                                                       // console.log(filter_occ_obj);

                                                            //       for(var i=0;i<listing.length;i++){
 
                                                            //         for(j=0;j<listing[i].occassion_list.length;j++){

                                                            //             if(listing[i].occassion_list[j].status=='true' && filter_occ.indexOf(listing[i].occassion_list[j].group_attr)<0 ){

                                                            //                     filter_occ.push(listing[i].occassion_list[j].group_attr);
                                                            //                     total_occ++;
                                                            //             }
                                                            //         }
                                                            //  }

                                                            //THIS IS THE FORMAT THAT I WANT----------
                                                            // cuisine_filter: [{
                                                                                //     'cuisine_name':'italian',
                                                                                //     'cuisine_count':4

                                                                                // },
                                                                                // {
                                                                                //     'cuisine_name':'New cuisine',
                                                                                //     'cuisine_count':2
                                                                                // },
                                                                                // ]
                                                                filter.listing=listing;
                                                                filter.cuisine_list=filter_cuisine_obj;
                                                                filter.occasion_list=filter_occ_obj;
                                                         //  console.log(filter);
                                                          //  console.log(total_occ);

                                                    
                                                           res.status(200).send(filter);
                                                   
                                        });
});


router
.post('/filter-cook-listing',function(req,res,next){

console.log(req.body);
                
                db.cook_infos.find({    'food_details.cuisine_list':{"$elemMatch" :{'category_name':'Italian'
                ,'status':'false'}}
                                       
                                        }, function (err, data, lastErrorObject) {
                                    
                                    
                                            if(err){
                                                    res.status(400);
                                                    res.send('error');
                                                     throw err;

                                                    }    
                                                    res.status(200).send(data);
                                                    console.log(data);
                                        });
});

module.exports = router;

