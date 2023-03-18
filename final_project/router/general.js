const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
      return user.username === username
    });
    if(userswithsamename.length > 0) { return true;} 
    else { return false;}
  }

// Register a new user
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      if (!doesExist(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registered"});
      } else {
        return res.status(404).json({message: "User already exists"});
      }
    } 
    return res.status(404).json({message: "Username and/or password missing"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(JSON.stringify(books[isbn], null, 4));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    var booksByAuthor = Object.keys(books)
                              .filter(isbn => books[isbn].author === author)
                              .reduce( (val, key) => (val[key] = books[key], val), {} );

    res.send(JSON.stringify(booksByAuthor, null, 4));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    var booksByTitle = Object.keys(books)
                              .filter(isbn => books[isbn].title === title)
                              .reduce( (val, key) => (val[key] = books[key], val), {} );

    res.send(JSON.stringify(booksByTitle, null, 4));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (isbn in books) {
        res.send(JSON.stringify(books[isbn].reviews, null, 4));
    } else {
        return res.status(404).json({message: "Book with specified ISBN not found"});
    }
});

module.exports.general = public_users;
