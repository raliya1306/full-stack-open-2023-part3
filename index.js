const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

morgan.token('data', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(express.static('dist'))

let persons = []

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
		response.json(persons)
	})
})

app.get('/info', (request, response) => {
  const requestDate = new Date()
	Person.find({}).then(persons => {
		response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${requestDate.toString()}</p>
  	`)
	})
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  const existingName = persons.filter(p => p.name.toLowerCase() === body.name.toLowerCase())

  if (!body.name) {
    return response.status(400).json({
      error: 'name must be entered'
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number must be entered'
    })
  } else if (existingName.length > 0) {
    return response.status(400).json({
      error: 'name already exists'
    })
  } else {
  const id = Math.floor(Math.random() * 100000)
  const person = {
    id,
    name: body.name,
    number: body.number
  }
  
  persons = persons.concat(person)
  response.json(person)
  }
})

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})