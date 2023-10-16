require('dotenv').config()
const express = require('express')
const fs = require('fs')
const app = express()
const morgan = require('morgan')
var path = require('path')
const Person = require('./models/person')
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
app.use(express.static('dist'))

port = process.env.PORT || 3001

app.get('/', (req, res) => {
    res.send('PERSONS API')
})

app.get('/info', (req, res) => {
    Person.countDocuments({})
        .then((count) => {
            let info =
                count !== 0
                    ? '<p>Phonebook has info for ' + count + ' people</p>'
                    : '<p>Phonebook has no data yet.</p>'
            let date = '<p> ' + new Date() + '</p>'
            info += date

            res.send(info)
        })
        .catch(error => {
            console.log("Error counting documents: " + error)
            res.send({
                msg: "Error counting Documents",
                error
            })
        })



})

app.get('/api/persons', (req, res) => {
    Person.find({})
        .then(persons => res.send(persons))
        .catch(error => console.log("Error retreiving persons data"))
})

app.get('/api/persons/:id', (req, res, next) => {
    let id = req.params.id
    Person.findById(id)
        .then(person => {
            person
                ? res.send(person)
                : res.status(404).send('<h1>ERROR 404: person with id ' + id + ' not found.</h1>')
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    let id = req.params.id
    Person.findByIdAndDelete(id)
        .then(res.status(204).send())
        .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    reqBody = JSON.stringify(req.body)

    let { name, number } = req.body

    if (name === '' || number === '') {
        return res.status(400).send({
            msg: "Error: The name or number is missing"
        })
    }

    Person.findOne({ name: name })
        .then((person) => {
            if (person) {
                return res.send({
                    msg: "Error: The name already exists in the phonebook: " + person.name
                })
            } else {
                const person = new Person({
                    name: name,
                    number: number
                })

                person.save()
                    .then(res.send(person))
                    .catch(error => console.log("Error saving new Person: " + error))
            }
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    let id = req.params.id
    let { name, number } = req.body
    Person.findById(id)
        .then(person => {
            if (!person) {
                res.send({
                    msg: "Error: Not person found with id " + id
                })
            }
            person.number = number
            person.save()
                .then(() => res.send(person))
                .catch(error => console.log("Error updating person info: " + error))
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    response.status(500).send({ error: 'Something went wrong' });

}

app.use(errorHandler)

app.listen(port, () => {
    console.log("Running in Port: " + port)
})

