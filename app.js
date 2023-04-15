//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-anupam:av1234@cluster0.s6kmq4o.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("item",itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List",listSchema);


const newItem1 = new Item({
  name: "Welcome to your todolist!"
});

const newItem2 = new Item({
  name: "Hit the + button to add a new item."
});

const newItem3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [newItem1,newItem2,newItem3];

app.get("/", function(req, res) {

  Item.find({}).then((founditems)=>{

    //if the founditems array has length == 0 then only we insert the default values o
    if(founditems.length === 0){
      

      Item.insertMany(defaultItems).then(function(){
        console.log("Successfully Inserted the default values in the database.");
      }).catch((err)=>{
        console.log(err);
      });

      res.redirect("/");

    }else{
      res.render("list", {listTitle: "Today", newListItems: founditems});
    }
  }).catch((err)=>{
    console.log(err);
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    }).catch((err)=>{
      console.log(err);
    });
  }



});

app.post("/delete",function(req,res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id:checkedItemId}).then(function(){
      console.log("Successfully deleted");
      res.redirect("/");
    }).catch((err)=>{
      console.log(err);
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(){
      res.redirect("/"+listName);
    }).catch((err)=>{
      console.log(err);
    });
  }


})

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  //we check if the list with that name already exist

  List.findOne({name: customListName}).then((foundList)=>{
    if(!foundList){
      //create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    
      list.save();

      res.redirect("/"+customListName);

    }else{
      //show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }).catch((err)=>{
    console.log(err);
  });


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
