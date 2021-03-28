// eslint-disable-next-line
/* global fetch */

import React from "react";
import Login from "./components/Login";
import Nav from "./components/Nav";
import Home from "./components/Home";
import Workout from "./components/Workout";
import Schedule from "./components/Schedule";
import WorkoutActivity from "./components/WorkoutActivity";
import Activity from "./components/Activity";
import Toast from "./components/Toast";

class App extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			isLoading: true,
			isLoggedIn: false,
			currentWorkout: null,
			toast: {
				text: "",
				isActive: false,
				type: "info"
			}
		};
	}
	
	showToast = (message, isError) => {
		this.setState({
			toast: {
				text: message,
				isActive: true,
				type: isError ? "error" : "info"
			}
		});
		
		setTimeout(() => {
			this.setState({
				toast: {
					text: "",
					isActive: false,
					type: "info"
				}
			});
		}, 4000);
	}
	
	componentDidMount() {
		fetch("http://workout.beynum.com/workout/api/appload", { credentials: "include" })
			.then(response => response.json())
			.then(data => {
				
				this.setState({
					isLoggedIn: data.loggedIn,
					user: data.user,
					page: data.loggedIn ? <Home startWorkout={this.startWorkout} toast={this.showToast} user={ data.user } /> : <Login toast={this.showToast} />,
					isLoading: false
				});
				
			});
	}
	
	componentDidCatch(error, info) {
		fetch("http://workout.beynum.com/workout/api/errorsave", { method: "post", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({error: { error: error, info: info } }) });
	}
	
	changePage = (page) => {
		if (this.state.isLoggedIn) {
			switch (page) {
				case "home":
					this.setState({ page: <Home startWorkout={this.startWorkout} toast={this.showToast} user={ this.state.user } /> });
					break;
				
				case "workout":
					this.setState({ page: <Workout startActivity={this.startActivity} toast={this.showToast} /> });
					break;
				
				case "workoutactivity":
					this.setState({ page: <WorkoutActivity workoutId={ this.state.currentWorkout } activityComplete={this.activityComplete} toast={ this.showToast } /> });
					break;
				
				case "activity":
					this.setState({ page: <Activity workoutId={ this.state.currentWorkout } activityComplete={this.activityComplete} toast={this.showToast} /> });
					break;
				
				case "schedule":
					this.setState({ page: <Schedule toast={this.showToast} /> });
					break;
				
				default:
					break;
			}
		}
	}
	
	startActivity = workoutId => {
		this.setState(() => ({ 
			currentWorkout: workoutId 
		}),
		() => { this.changePage("activity"); }
		);
	}
	
	startWorkout = workoutId => {
		this.setState({
			currentWorkout: workoutId
		}, () => { this.changePage("workoutactivity") });
	}
	
	activityComplete = () => {
		this.setState(() => ({ 
			currentWorkout: null
		}),
		() => { this.changePage("home"); }
		);
	}
	
	render() {
		return (
			<div className="pageContainer">
			{
				this.state.isLoading ?
					<div>Loading</div>
				:
				this.state.page
			}
			{	
				this.state.isLoggedIn ? <Nav changePage={ this.changePage } /> : null
			}
				<Toast message={ this.state.toast } />
			</div>
		);
	}
	
}

export default App;