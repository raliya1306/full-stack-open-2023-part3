const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(express.json())

morgan.token('data', function (req, res) {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  const numOfPersons = persons.length
  const requestDate = new Date()
  response.send(`
    <p>Phonebook has info for ${numOfPersons} people</p>
    <p>${requestDate.toString()}</p>
  `)
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

const PORT = 3001
app.listen(PORT)