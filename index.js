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

const errorHandler = (error, request, response, next) => {
	console.log(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id'} )
	}

	next(error)
}

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint'})
}

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

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
		.then(person => {
			if (person) {
				response.json(person)
			} else {
				response.status(404).end()
			}
		})
		.catch(error => next(error))
 })

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndDelete(request.params.id)
		.then(result => {
			response.status(204).end()
		})
		.catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'name must be entered'
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number must be entered'
    })
  } else {
		const person = new Person({
			name: body.name,
			number: body.number
		})

		person.save().then(savedPerson => {
			response.json(savedPerson)
		})
	}
})

app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body

	const person = {
		name: body.name,
		number: body.number
	}

	Person.findByIdAndUpdate(request.params.id, person, { new: true })
		.then(updatedPerson => {
			response.json(updatedPerson)
		})
		.catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})