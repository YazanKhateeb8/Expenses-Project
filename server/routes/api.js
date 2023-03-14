const { log } = require("console");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const Expense = require("../model/Expense");



//  data.forEach(e => {
//        let  expense = new Expense({ item : e.item, amount : e.amount, date : e.date, group : e.group})
//        expense.save()
// db.expenses.find({}).sort({date: 'desc'}).toArray()
// })



router.get("/expenses", function (req, res) {
  let d1 = req.query.d1 
  let d2 = req.query.d2? req.query.d2:new Date();
  let startDate = moment(d1).format("YYYY-MM-DD")
  let endDate = moment(d2).format("YYYY-MM-DD")

 

  if(d1){
    
    Expense.find({
          date: {
            $gte: startDate,
            $lte: endDate,
          }
        })
          .sort({ date: "asc" })
          .then((expenses) => {
            res.status(200).send(expenses);
          });
  } 
   else {
    Expense.find({})
      .sort({ date: "asc" })
      .then((expenses) => {
        res.status(200).send(expenses);
      });
  }
});




router.post("/expense", function (req, res) {
  let expense = req.body;
  let item = expense.item;
  let amount = expense.amount;
  let group = expense.group;
  let date = expense.date ? date : moment().format("LLLL");
  let newExpense = new Expense({ item, amount, group, date });

  newExpense.save()
    .then((expense) => {
      res.status(201).send(`you spent ${expense.amount} on this item : ${expense.item}`);
    })
    .catch((err) => {
      res.status(409).send(err);
    });
});




router.put("/update", function (req, res) {
  let group1 = req.body.group1;
  let group2 = req.body.group2;

  Expense.findOneAndUpdate({ group: group1 }, { $set: { group: group2 } } , { new: true })
    .then((expense) => {
      res.status(200).send(`Expense ${expense.item} updated to group ${expense.group}.`);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});




router.get("/expenses/:group", function (req, res) {
  let group = req.params.group;
  let total = req.query.total;

  if (total == "true") {
    Expense.aggregate([
      { $match: { group: group } },
      { $group: { _id: "$group", total: { $sum: "$amount" } } },
    ])
      .exec()
      .then((expense) => res.send(expense));
  }
  else{

    Expense.find({ group })
    .then((expenses) => {
      res.status(200).send(expenses);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
  }
  
});



module.exports = router;
