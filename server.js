const express = require('express')
const router = express.Router()
const http = require('http')
const socketIo = require('socket.io')
const port = process.env.PORT || 3100
const app = express()

const MongoClient = require('mongodb').MongoClient

const accountSid = 'AC3c45dde52adca54e31fdf6a412a3b1e6'
const authToken = 'f1c235fa38e2985504df855f54f0bbca'

const client = require('twilio')(accountSid, authToken)
const bodyParser = require('body-parser')

app.use(
	bodyParser.urlencoded({
		extended: true
	})
)
app.use(bodyParser.json())

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
	res.setHeader('Access-Control-Allow-Credentials', 'true')
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET,HEAD,OPTIONS,POST,PUT,DELETE'
	)
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
	)
	res.setHeader('Cache-Control', 'no-cache')
	next()
})

const server = http.createServer(app)

const io = socketIo(server)

server.listen(3200, () => {
	console.log('socket.io listening on port 3200')
})

router.get('/', function(req, res) {
	res.json({ message: 'API Initialized!' })
})

app.use('/api', router)

app.listen(port, function() {
	console.log(`api running on port ${port}`)
})

io.on('connection', socket => {
	console.log('Client connected')

	socket.on('get-user', data => {
		const timestamp = new Date()
		const user = {
			_id: data.sub,
			lastUpdated: timestamp,
			email: data.email,
			firstname: data.given_name,
			lastname: data.family_name
		}

		MongoClient.connect(
			'mongodb://jsprow:N8fdwn8D3YTW@ds251985.mlab.com:51985/sms-to-pos',
			{ native_parser: true },
			(err, db) => {
				if (err) throw new Error(err)

				const users = db.collection('users')

				users.updateOne(
					{ _id: user._id },
					{ $set: user },
					{ upsert: true },
					(err, res) => {
						if (err) throw new Error(err)
						console.log('user inserted')
					}
				)
			}
		)
	})

	app.post('/api/sms', (req, res) => {
		console.log(`mobile=${req.body.From} message=${req.body.Body}`)

		io.emit('incoming', {
			mobile: req.body.From,
			message: req.body.Body,
			image: req.body.MediaUrl0
		})
	})

	socket.on('reply', data => {
		client.messages
			.create({
				to: data.mobile,
				from: '+12696017387',
				body: data.message
			})
			.then(message => console.log(`SID=${message.sid}`))
	})

	socket.on('disconnect', () => console.log('Client disconnected'))
})
