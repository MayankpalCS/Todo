const express=require("express")
const ejs=require("ejs")
const mongoose=require("mongoose")
const parser=require('body-parser')
const bcrypt=require("bcrypt")

// mongoose
try{
    mongoose.connect('mongodb://localhost/todo')
}catch{
    console.log("Can not connect to the databse")
}

const schema= mongoose.Schema({
    name:{type:String},
    email:{type:String},
    password:{type:String}
})
const time=mongoose.Schema({
    user:{type:String,required:true},
    work:{type:String,required:true},
    time:{type:String,required:true},
    status:{type:String}
})
const users=mongoose.model('users',schema)
const timetable=mongoose.model('timings',time)
// Middlewares

const app=express()
app.use('/static', express.static('public'))
app.set('view engine','ejs')
app.use(parser.urlencoded({extended:true}))

// Get routes
app.get('/',(req,res)=>{
    res.render("index")
})
app.get('/user',function(req,res){
    res.render('login')
})
app.get('/register',function(req,res){
    res.render('register')
})



// post routes
app.post('/adding',async function(req,res){
    let work=req.body.work
    let time=req.body.time
    let user=req.body.button
    
    
    let resp=await timetable.create({
        user:user,
        work:work,
        time:time
    })
    let timeresp=await timetable.find({})
    res.render('todo',{name:user,timeresp:timeresp})
    
})
app.post('/removing',async function(req,res){
    let name=req.body.name
    let work=req.body.work
    let resp=await timetable.deleteOne({name:name,work:work})
    let timeresp=await timetable.find({})
    res.render('todo',{name:name,timeresp:timeresp})    
})
app.post('/user',async function(req,res){
    let name=req.body.name
    let password=req.body.password
    let user=await users.findOne({name:name})
    
    if(!user){
        return res.json("No user like this exist")
    }else{
        let matchpass=await bcrypt.compare(password,user.password)
        if(matchpass){
            let timeresp=await timetable.find({})
            res.render('todo',{name:name,timeresp:timeresp})
        }else{
            return res.json('Passwords do not match')
        }
        
    }
})
app.post('/register',async function(req,res){
    let name=req.body.name;
    let email=req.body.email;
    console.log(email)
    let password=req.body.password
    let hashedpass=await bcrypt.hash(password,10)
    user=await users.findOne({name:name})
    emaila=await users.findOne({email:email})
    if(password.length<5){
        return res.json("password is tooo short")
    }else if(user){
        return res.json("A user with same name already exists")
    }else if(emaila){
        return res.json("A user with same email already exists")
    }else{
        let resp=await users.create({
            name:name,
            email:email,
            password:hashedpass
        })
        return res.json("User successfully created")
    }
    
})
app.listen(3000,function(req,res){
    console.log("Server stated at port 3000")
})