const express = require('express');
const router = express.Router();

//---------User model----------//
const User=require('../models/User');
const Habit=require('../models/Habit');

//---------Welcome Page----------//
router.get('/',(req,res)=>res.render('welcome'));

//---------Dashboard GET----------//
var user_email= "";
router.get('/home',(req,res) => {
    user_email = req.query.user;
    User.findOne({
        user_email: req.query.user,
    }).then(user=>{
        Habit.find({
            user_email: req.query.user
        },(err,habits)=>{
            if(err){
                console.log(err);
            }
            else {
                var days = [];
                days.push(getDt(0));
                days.push(getDt(1));
                days.push(getDt(2));
                days.push(getDt(3));
                days.push(getDt(4));
                days.push(getDt(5));
                days.push(getDt(6));
                res.render('home',{ habits,user,days});
            }
        });
    })
}
);

//------------------Function for return the date-string--------------//
function getDt(e) {
    let dt = new Date();
    dt.setDate(dt.getDate()+e);
    var newDates= dt.toLocaleDateString('pt-br').split('/').reverse( ).join('-');
    var day;
    switch (dt.getDay()) {
        case 0: day = 'Sun';
            break;
        case 1: day = 'Mon';
            break;
        case 2: day = 'Tue';
            break;
        case 3: day = 'Wed';
            break;
        case 4: day = 'Thu';
            break;
        case 5: day = 'Fri';
            break;
        case 6: day = 'Sat';
            break;
    }
    return {date:newDates,day};
}

//-------------Handle Change View: Daily <--> Weekly--------------//
router.post('/user-view',(req, res)=>{
    User.findOne({
        email
    }).then(user=>{
            user.views=user.views==='daily'?'weekly':'daily';
            user.save().then(user=>{
                    return res.redirect('back');
                }).catch(err => console.log(err));
        }).catch(err => {
            console.log("Something Error in changing user views!");
            return;
        })
})

//---------Add Habit----------//
router.post('/home', (req, res) => {
    const { content } = req.body;

    Habit.findOne({ content:content,email:email}).then(habits=>{
        if (habits) {
            //---------Update my already existing habit----------//
            let dates=habits.dates, timeZoneOffset = (new Date()).getTimezoneOffset() * 60000;
            var today = (new Date(Date.now() - timeZoneOffset)).toISOString().slice(0, 10);
            dates.find(function (list_item, index) {
                if (list_item.date === today) {
                    console.log("Habit already exists!")
                    req.flash('error_msg','Habit already exists!'
                    );
                    res.redirect('back');
                }
                else {
                    dates.push({ date: today, completed: 'none' });
                    habits.dates = dates;
                    habits.save().then(habits=> {
                            console.log(habits);
                            res.redirect('back');
                        })
                        .catch(err => console.log(err));
                }
            });
        }
        else {
            let dates = []; 
            let timeZoneOffset = (new Date()).getTimezoneOffset() * 60000;
            var localISOTime = (new Date(Date.now() - timeZoneOffset)).toISOString().slice(0, 10);
            dates.push({ date: localISOTime, complete: 'none' });
            const newHabit = new Habit({
                content,
                email,
                dates
            });

            //---------Save Your Habit----------//
            newHabit.save().then(habits=> {
                   // console.log(habit);
                    res.redirect('back');
                })
                .catch(err => console.log(err));
        }
    })
});

//---------Here Dashboard for Adding or Removing  Habit to orfrom Favorites----------//
router.get("/favorite-habit",(req,res)=>{
    let id=req.query.id;
    Habit.findOne({
        _id:{$in:[
                id
            ]
        },
        email
    })
        .then(habits => {
            habits.favorite = habits.favorite ? false : true;
            habits.save().then(habits=>{
                    req.flash('success_msg',habits.favorite ? 'Habit added to Favorites!' : 
                        'Habit removed from Favorites!'
                    );
                    return res.redirect('back');
                }).catch(err => console.log(err));
        })
        .catch(err=>{
            console.log("something Error in adding my favorites habits!");
            return;
        })
});

//-------------Update the status after your habit completion--------------//
router.get("/status-update",(req, res)=>{
    var dt=req.query.date;
    var id=req.query.id;
    Habit.findById(id,(err,habits)=>{
        if (err){
            console.log("Something Error in updating status!")
        }
        else{
            let dates=habits.dates;
            let item_found=false;
            dates.find(function(list_item,index) {
                if (list_item.date===dt) {
                    if (list_item.completed==='yes') {
                        list_item.completed='no';
                    }
                    else if (list_item.completed==='no') {
                        list_item.completed='none'
                    }
                    else if(list_item.completed==='none') {
                        list_item.completed='yes'
                    }
                    item_found=true;
                }
            })
            if(!item_found){
                dates.push({ date:dt,completed:'yes'})
            }
            habits.dates = dates;
            habits.save().then(habits=>{
                    console.log(habits);
                    res.redirect('back');
                }).catch(err=>console.log(err));
        }
    })
})

//---------Deleting a habit----------//
router.get("/remove",(req,res)=>{
    let id=req.query.id;
    Habit.deleteMany({
        _id:{$in:[
                id
            ]
        },
        email},(err)=>{
        if(err){
            console.log("Soething error Error in deleting your record(s)!");
        }
        else{
            req.flash(
                'success_msg',
                'Your record deleted successfully!,Add new record'
            );
        return res.redirect('back');
        }
    })
});

module.exports=router;