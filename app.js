//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rupesh:Pass123@cluster0.1gwrw.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model('Item', itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  list: [itemSchema]
});

const List = mongoose.model('List', listSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new todo."
});

const item3 = new Item({
  name: "<-- Hit this to delete a task."
});

app.get("/", function(req, res) {

  Item.find(function(err, result) {
    if(err) {
      console.log(err);
    } else {
      if (result.length === 0) {
        Item.insertMany([item1, item2, item3], function(err) {
          if(err) {
            console.log(err);
          } else {
            console.log("Successfully inserted three items.");
          }
        })
        res.redirect('/');
      } else {
        res.render("list", {listTitle: "Today", newListItems: result});
      }
    }
  })

});

app.post("/", function(req, res){
  const newItem = req.body.newItem;
  const item = new Item({
    name: newItem
  });

  const listTitle = req.body.list;
  if(listTitle === 'Today') {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({name: listTitle}, function(err, foundList) {
      if(!err) {
        foundList.list.push(item);
        foundList.save();
        res.redirect('/' + listTitle);
      }
    })
  }
});

app.post('/delete', function(req, res) {
  console.log(req.body);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listTitle;

  if (listName === 'Today') {
    Item.deleteOne({_id: checkedItemId}, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("Successfully deleted.");
    }
  })
  res.redirect("/");  
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {list: {_id: checkedItemId}}}, function(err, foundItem) {
      if(!err) {
        console.log("Successfully updated");
      }
    })
    res.redirect('/' + listName);
  }
});

app.get('/:listName', function(req, res) {
  const listName = _.capitalize(req.params.listName);
  List.findOne({name: listName}, function(err, item) {
    if(item) {
      res.render('list', {listTitle: listName, newListItems: item.list});
    } else {
      const newList = new List({
        name: listName,
        list: [item1, item2, item3]
      });
      newList.save();
      res.redirect('/' + listName);
      console.log("Created new list");
    }
  })
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
