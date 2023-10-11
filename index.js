require('dotenv').config()
const express = require('express')
const fs = require('fs')
const app = express()
const morgan = require('morgan')
var path = require('path')

//middlewares
app.use(express.json())

app.use((req, res, next) => {
    req.reqBody = JSON.stringify(req.body);
    next();
  });
//write stream
let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

morgan.token('reqBody', (req) => req.reqBody);

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqBody', { stream: accessLogStream }));

const cors = require('cors')
app.use(cors())

let persons = require('./personsDB.js')
port = process.env.PORT || 3001

app.get('/', (req, res) => {

    res.send('PERSONS API')
})

app.get('/info', (req, res) => {
    let info =
        persons.length !== 0
            ? '<p>Phonebook has info for ' + persons.length + ' people</p>'
            : '<p>Phonebook has no data yet.</p>'
    let date = '<p> ' + new Date() + '</p>'
    info += date
  
    res.send(info)
})

app.get('/api/persons', (req, res) => {

    res.send(persons)
})

app.get('/api/persons/:id', (req, res) => {

    let id = Number(req.params.id)
    let person = persons.find(person => person.id === id)
    person
        ? res.send(person)
        : res.status(404).send('<h1>ERROR 404: person with id ' + id + ' not found.</h1>')
})

app.delete('/api/persons/:id', (req, res) => {
    
    let id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).send()
})

const generateID = () => {
    return Math.floor(Math.random() * 1000) + 1
}
app.post('/api/persons', (req, res) => {
    reqBody = JSON.stringify(req.body)

    let { name, number } = req.body
    let id = generateID()
    let flag = persons.find(person => person.name === name)
    if (name === '' || number === '') {
        return res.status(400).send({
            msg: "Error: The name or number is missing"
        })
    }
    if (flag) {
        return res.status(400).send({
            msg: "Error: The name already exists in the phonebook"
        })
    }
    const newPerson = {
        id,
        name,
        number
    }
    persons = persons.concat(newPerson)
    return res.send(newPerson)
})

app.listen(port, () => {
    console.log("Running in Port: " + port)
})

