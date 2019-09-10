const express = require('express');

const db = require('./data/dbConfig.js');

const server = express();

server.use(express.json());

//crud operations
server.get('/accounts/', (req, res) => {
    db('accounts')
        .select('name', 'budget')
        .then(accounts => {
            console.log(accounts);
            res.status(200).json(accounts);
        })
        .catch(error => {
            console.log(error);
            res.json(error);
        })
});

server.get('/accounts/:id', validateId, (req, res) => {
    res.status(200).json(req.data);  
});

server.post('/accounts/', validateAccount, validateName, (req, res) => {
    db('accounts')
        .insert(req.body, 'id')
        .then(([id]) => {
            db('accounts').where({ id })
            .then(response => {
                res.status(200).json(response).first();
            })
            .catch(error => {
                console.log(error);
                res.json(error);
            })
        })
        .catch(error => {
            console.log(error);
            res.json(error);
        });
});

server.put('/accounts/:id', validateId, validateAccountUpdate, validateName, (req, res) => {
    db('accounts')
        .where('id', `${req.params.id}`).update(req.body)
        .then(count => {
            res.status(200).json({ message: `Updated ${count} records`})
        })
        .catch(error => {
            console.log(error);
            res.json(error);
        });
});

server.delete('/accounts/:id', validateId, (req, res) => {
    db('accounts')
        .where({ id: req.params.id })
        .del()
        .then(count => {
            res.status(200).json({ message: `Deleted ${count} records`})
        })
        .catch(error => {
            console.log(error);
            res.json(error);
        });
});


//custom middleware
function validateId(req, res, next){
    db('accounts')
        .select('*')
        .where('id', `${req.params.id}`)
        .first()
        .then(response => {
            if (response){
                req.data = response;
                next();
            } else {
                res.status(404).json({ message: 'No account  with that ID exists.' })
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ message: 'There was an error retrieving that ID.' })
        });
};

function validateAccount(req, res, next){
    const account = req.body;
    if (!account.name){
        res.status(400).json({ message: 'An account name is required.' })
    }
    if (!account.budget){
        res.status(400).json({ message: 'An account budget is required.' }) 
    }
    if (typeof account.name !== 'string'){
        return res.status(400).json({ message: "Account name must be provided as a string." })
    }
    if (typeof account.budget !== 'number'){
        return res.status(400).json({ message: "Account budget must be provided as a number." })
    }
    next();
};

function validateAccountUpdate(req, res, next){
    const account = req.body;
    if (!account.name && !account.budget) {
        return res.status(400).json({ errorMessage: "Please provide a name and budget for the project." });
    }
    if (account.name && (typeof account.name !== 'string')){
        return res.status(400).json({ message: "Account name must be provided as a string." })
    }
    if (account.budget && (typeof account.budget !== 'number')){
        return res.status(400).json({ message: "Account budget must be provided as a number." })
    }
    next();
}

function validateName(req, res, next){
    db('accounts')
        .select('*')
        .where('name', `${req.body.name}`)
        .first()
        .then(response => {
            if (response){
                res.status(400).json({ message: 'An account with that name already exists. Please select a unique name for your account.' })
            }
            next()
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({ message: 'There was an error checking that name in the database.' })   
        });
};


module.exports = server;