const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let matchingusers = users.filter((user) => {
        return (user.username === username)
    });
    if(matchingusers.length > 0) {return true;} 
    else {return false;}
}

const authenticatedUser = (username,password) => {
    let matchingusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if(matchingusers.length > 0) {return true;} 
    else {return false;}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !isValid(username)) {
        return res.status(404).json({message: "Username missing/invalid"});
    }
    if (!password) {
        return res.status(404).json({message: "Password is missing"});
    }
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
            data: password }, 'access', { expiresIn: 60 * 60 });
            req.session.authorization = { accessToken,username }
            return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization['username'];
    const isbn = req.params.isbn;
    const newReview = req.body.review;
    if (!(isbn in books)) {
        return res.status(404).json({message: "Book with specified ISBN not found"}); 
    }
    let reviewsForBook = books[isbn].reviews;
    if (username in reviewsForBook) {
        reviewsForBook[username] = newReview;
        return res.status(200).json({message: "Previous review successfully modified"});
    } else {
        reviewsForBook[username] = newReview;
        return res.status(200).json({message: "New review successfully added"});
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization['username'];
    const isbn = req.params.isbn;
    if (!(isbn in books)) {
        return res.status(404).json({message: "Book with specified ISBN not found"}); 
    }
    let reviewsForBook = books[isbn].reviews;
    if (username in reviewsForBook) {
        delete reviewsForBook[username];
        return res.status(200).json({message: "Review successfully deleted"});
    } else {
        return res.status(200).json({message: "No review was found for this book and user"});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
