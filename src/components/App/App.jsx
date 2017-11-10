import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import './App.css'

import Home from './../Home/Home.jsx'
import LoginForm from './../LoginForm/LoginForm.jsx'
import SMSList from './../SMSList/SMSList.jsx'

import { Security, SecureRoute, ImplicitCallback } from '@okta/okta-react'

const config = {
	issuer: 'https://dev-398274.oktapreview.com/oauth2/default',
	redirectUri: window.location.origin + '/implicit/callback',
	clientId: '0oacsdu0h8oZTpktX0h7'
}

export default class App extends Component {
	render() {
		return (
			<Router>
				<Security
					issuer={config.issuer}
					client_id={config.clientId}
					redirect_uri={config.redirectUri}
				>
					<Route path="/" exact component={Home} />
					<Route
						path="/login"
						exact
						render={() => (
							<LoginForm baseUrl="https://dev-398274.oktapreview.com" />
						)}
					/>
					<SecureRoute path="/sms-list" component={SMSList} />
					<Route
						path="/implicit/callback"
						component={ImplicitCallback}
					/>
				</Security>
			</Router>
		)
	}
}
