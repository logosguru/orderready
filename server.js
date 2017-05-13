// https://zellwk.com/blog/crud-express-mongodb/

const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
var app = express()
var db
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended:true}))

app.get('/', (req, res) => {
    db.collection('orders').find().toArray((err,result) =>{
        if (err) return console.log(err)
        res.render('index.ejs', {orders: result})
    })
});

app.post('/orders', (req, res) => {
    db.collection('orders').save(req.body, (err, result) => {
        if (err) return console.log(err)

        console.log('saved to database')
        res.redirect('/')
    })
});

MongoClient.connect('mongodb://order-ready:Oasis#353#@ds139801.mlab.com:39801/order-ready', (err, database) => {
    if (err) return console.log(err)
    db = database
    app.listen(3000, () => {
        console.log('listening on 3000 port')
    })
})