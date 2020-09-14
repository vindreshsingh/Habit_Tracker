const express = require('express');
const router = express.Router();

//---------User model----------//
const User = require('../models/User')

//------For SignIn Page--------//
router.get('/signin',(req,res)=>{
     res.render('signin')
});

//------TFor SignUp Page ------//
router.get('/signup',(req, res)=>{
    res.render("signup")
} );

//------Handle SignUp Page-------//
router.post('/signup',(req,res)=>{
    const name=req.body.name;
    const email = req.body.email;

    //-----Checking error is signup page----//
    let errors = [];

    if (!name) {
        errors.push({ msg: 'please enter your name' });
    }
  else if(!email){
 errors.push({msg:"please enter your existing email"});
  }
    if (errors.length>0) {
        res.render('signup',{
            errors,
            name,
            email
        });
    } 
    else{
        //----passed some validation----//
        User.findOne({ email: email }).then(user=>{
            if(user){
                //----User already existing here------//
                errors.push({ msg: 'This email ID already exists,so enter another or login ' });
                res.render('signup',{
                    errors,
                    name,
                    email
                });
            } else {
                const newUser=new User({
                    name,
                    email
                });

                //---------Saved user ----------//
                newUser.save().then(user=>{
                        req.flash(
                            'success_msg',
                            'You are now registered and so you can signin in'
                        );
                        res.redirect('/users/signin');
                    }).catch(err=>console.log(err));
            }
        });
    }
});

//---------Handle Signing page----------//
router.post('/signin',(req, res)=>{
    const name=req.body.name;
    email= req.body.email;
    //---------check user details from database----------//
    User.findOne({email:email
    }).then(user=>{
        if (!user){
            let errors=[];
            errors.push({ msg: 'please signup with this email id' });
            res.render('signin',{
                errors,
                name,
                email
            });
        }
        //---------Redirect to dashboard----------//
        else {
            res.redirect(`/home?user=${user.email}`);
        }
    });

});

//---------Logout Handle----------//
router.get('/signout', (req, res) => {
    // req.logout();
    //here is the flash msg for succesfully logout 
    req.flash('success_msg', 'You are successfully logged out,try to login again');
    res.redirect('/users/signin');
});

module.exports = router;