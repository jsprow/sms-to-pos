import React, { Component } from 'react'

import socketIOClient from 'socket.io-client'

import './SMS.css'

export default class SMS extends Component {
	constructor(props) {
		super(props)

		this.state = {
			endpoint: 'http://127.0.0.1:3200',
			mobile: this.props.mobile,
			message: this.props.message,
			image: this.props.image,
			value: '',
			replyBox: ''
		}

		this.handleReply = this.handleReply.bind(this)
		this.reply = this.reply.bind(this)
	}
	componentWillMount() {
		this.setState({
			replyBox: (
				<div className="sms-reply-box">
					<textarea
						id={this.props.id}
						value={this.state.value}
						onChange={this.handleReply}
					/>
					<button onClick={this.reply}>Reply</button>
				</div>
			)
		})
	}
	handleReply(e) {
		this.setState({ value: e.target.value })
	}
	reply() {
		const socket = socketIOClient(this.state.endpoint),
			mobile = this.state.mobile,
			reply = this.state.value

		socket.emit('reply', {
			mobile: mobile,
			message: reply
		})

		this.setState({
			value: '',
			replyBox: false,
			messageOut: reply
		})
	}
	render() {
		return (
			<li className="sms">
				<div className="sms-incoming-box">
					<p>{this.state.mobile}:</p>
					<p>{this.state.message}</p>
					{this.state.image
						? <img src={this.state.image} alt="incoming" />
						: ''}
				</div>
				{this.state.replyBox
					? <div className="sms-reply-box">
							<textarea
								id={this.props.id}
								value={this.state.value}
								onChange={this.handleReply}
							/>
							<button onClick={this.reply}>Reply</button>
						</div>
					: <div className="sms-incoming-box">
							<p>Josh:</p>
							<p>{this.state.messageOut}</p>
						</div>}
			</li>
		)
	}
}
