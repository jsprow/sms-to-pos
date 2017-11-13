import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withAuth } from '@okta/okta-react'

import socketIOClient from 'socket.io-client'

import SMS from './../SMS/SMS.jsx'

import guid from 'guid'

const testGuid = guid.create().value

export default withAuth(
	class App extends Component {
		constructor() {
			super()
			this.state = {
				responses: [
					{
						id: testGuid,
						mobile: '+12693529412',
						message: 'Test Message'
					}
				],
				endpoint: 'http://127.0.0.1:3200'
			}
		}
		componentDidMount() {
			const socket = socketIOClient(this.state.endpoint)

			this.props.auth.getUser().then(data => {
				socket.emit('get-user', data)
			})

			socket.on('incoming', data => {
				const mobile = data.mobile,
					message = data.message,
					image = data.image,
					newGuid = guid.create().value,
					responses = this.state.responses

				responses.push({
					id: newGuid,
					mobile: mobile,
					message: message,
					image: image
				})

				this.setState({ responses: responses })
			})
		}
		render() {
			return (
				<div>
					<Link to="/">Home</Link><br />
					<Link to="/sms-list">SMS List</Link><br />
					<button onClick={this.props.auth.logout}>Logout</button>
					<p>
						To test the app, send a message with or without a picture to (269) 601-7387
					</p>
					<ul className="sms-list" ref="smsList">
						{this.state.responses.map((response, index) => {
							return (
								<SMS
									key={index}
									id={response.id}
									mobile={response.mobile}
									message={response.message}
									image={response.image}
								/>
							)
						})}
					</ul>
				</div>
			)
		}
	}
)
