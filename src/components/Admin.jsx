// eslint-disable-next-line
/* global fetch */

import React from "react";
import "./admin.css";
import loadingImage from "../media/loading.gif";

class Admin extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: true
		};
	}

	componentDidMount() {
		this.loadData();
	}

	deleteDevice = (userIndex, deviceIndex) => {

		const userId = this.state.users[userIndex].id;
		const token = this.state.users[userIndex].devices[deviceIndex].token;

		fetch(`http://workout.beynum.com/api/deleteuserdevice?userid=${ userId }&token=${ token }`, { credentials: "include" })
			.then(response => response.json())
			.then(data => {

				this.props.toast("Device removed");
				this.loadData();

			})
			.catch(error => {
				
				console.warn(error);
				this.props.toast("Error deleting device", true);
				this.loadData();

			});
	}

	deleteRequest = requestIndex => {
		
		const requestId = this.state.requests[requestIndex].id;

		fetch(`http://workout.beynum.com/api/deleterequest?id=${ requestId }`, { credentials: "include" })
			.then(response => response.json())
			.then(data => {

				this.props.toast("Request removed");
				this.loadData();

			})
			.catch(error => {
				
				console.warn(error);
				this.props.toast("Error deleting request", true);
				this.loadData();

			});;
	}

	selectUser = requestIndex => event => {
		this.setState(({requests}) => ({
			requests: [
				...requests.slice(0, requestIndex),
				{
					...requests[requestIndex],
					userId: event.target.value
				},
				...requests.slice(requestIndex + 1)
			]
		}));
	}

	assignRequest = requestIndex => {
		const selectedRequest = this.state.requests[requestIndex];
		const selectedUser = this.state.users.find(user => user.id === selectedRequest.userId);

		if (selectedUser) {
			selectedUser.devices.push({
				token: selectedRequest.id,
				agent: selectedRequest.agent
			});

			selectedRequest.active = false;

			fetch(`http://workout.beynum.com/api/assignrequest`, { method: "post", headers: {"Content-Type": "application/json"}, credentials: "include", body: JSON.stringify({ user: selectedUser, accessrequest: selectedRequest }) })
				.then(response => response.json())
				.then(data => {
	
					this.props.toast("Request assigned");
					this.loadData();
	
				})
				.catch(error => {
					
					console.warn(error);
					this.props.toast("Error assigning request", true);
					this.loadData();
	
				});
		}
		else {
			this.props.toast("First select a user", true);
		}
	}

	loadData = () => {
		fetch(`http://workout.beynum.com/api/adminload`, { credentials: "include" })
			.then(response => response.json())
			.then(data => {
				
				const requests = data.requests.map(request => ({
					...request,
					requestDate: new Date(request.requestDate),
					deviceType: /win64/gi.test(request.agent) ? "Windows PC"
						: /cros/gi.test(request.agent) ? "Cromebook"
						: /mac os x/gi.test(request.agent) ? "iPhone / iPad"
						: /android/gi.test(request.agent) ? "Android"
						: "Other"
				}));
		
				const users = data.users.map(user => ({
					...user,
					devices: user.devices.map(device => ({
						...device,
						requestDate: new Date(device.requestDate),
						deviceType: /win64/gi.test(device.agent) ? "Windows PC"
							: /cros/gi.test(device.agent) ? "Cromebook"
							: /mac os x/gi.test(device.agent) ? "iPhone / iPad"
							: /android/gi.test(device.agent) ? "Android"
							: "Other"
					}))
				}));
		
				this.setState(({ 
					requests: requests,
					users: users,
					isLoading: false
				}));
			});
	}

	render() {
		return (
			<div className="page">

				{
				this.state.isLoading ?
					<div className="loading">
						<img alt="Loading" src={loadingImage} />
						<div>Loading...</div>
					</div>
				:
					<div>
						<div className="header">
							<h1>Users</h1>

							<div>
								<svg viewBox="0 0 24 24" fill="#000000" onClick={ () => this.loadData() }>
									<path d="M0 0h24v24H0V0z" fill="none"/>
									<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
								</svg>
							</div>
						</div>

						<div className="usersContainer">
						{
						this.state.users.map((user, userIndex) => (
							<div key={userIndex} className="userContainer">

								<div className="userInfo">
									<div>{ user.firstName + " " + user.lastName }</div>
								</div>

								<table className="userDevices">
								<tbody>
								{
								user.devices.map((device, deviceIndex) => (
									<tr key={deviceIndex}>
									<td>{ device.requestDate.getFullYear() + "/" + (device.requestDate.getMonth() + 1) + "/" + device.requestDate.getDate() }</td>
									<td>{ device.deviceType }</td>
									<td>{ device.domain }</td>
									<td>
										<div>
											<svg viewBox="0 0 24 24" fill="#000000" onClick={ () => this.deleteDevice(userIndex, deviceIndex) }>
												<path d="M0 0h24v24H0V0z" fill="none"/>
												<path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
											</svg>
										</div>
									</td>
									</tr>
								))
								}
								</tbody>
								</table>

							</div>
						))
						}
						</div>

						<h1>Requests</h1>

						<table className="requests">
						<tbody>
						{
						this.state.requests.map((request, requestIndex) => (
							<tr key={ requestIndex }>
							<td>{ request.requestDate.getFullYear() + "/" + (request.requestDate.getMonth() + 1) + "/" + request.requestDate.getDate() }</td>
							<td>{ request.deviceType }</td>
							<td>{ request.domain }</td>
							<td>
								<select value={ request.userId } onChange={ this.selectUser(requestIndex) }>
								<option value="">Assign To</option>
								{
								this.state.users.map((user, userIndex) => (
									<option key={ userIndex } value={ user.id }>{ user.firstName + " " + user.lastName }</option>
								))
								}
								</select>
								<svg viewBox="0 0 24 24" fill="#000000" onClick={ () => this.assignRequest(requestIndex) }>
									<path d="M0 0h24v24H0V0z" fill="none"/>
									<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7-.25c.22 0 .41.1.55.25.12.13.2.31.2.5 0 .41-.34.75-.75.75s-.75-.34-.75-.75c0-.19.08-.37.2-.5.14-.15.33-.25.55-.25zM19 19H5V5h14v14zM12 6c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-6 6.47V18h12v-1.53c0-2.5-3.97-3.58-6-3.58s-6 1.07-6 3.58zM8.31 16c.69-.56 2.38-1.12 3.69-1.12s3.01.56 3.69 1.12H8.31z"/>
								</svg>
							</td>
							<td>
								<div>
									<svg viewBox="0 0 24 24" fill="#000000" onClick={ () => this.deleteRequest(requestIndex) }>
										<path d="M0 0h24v24H0V0z" fill="none"/>
										<path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
									</svg>
								</div>
							</td>
							</tr>
						))
						}
						</tbody>
						</table>

					</div>
				}
			</div>
		);
	}
}

export default Admin;
