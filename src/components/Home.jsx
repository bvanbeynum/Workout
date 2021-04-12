// eslint-disable-next-line
/* global fetch */

import React from "react";
import "./home.css";
import loadingImage from "../media/loading.gif";

class Home extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			workouts: [],
			palette: [
			{
				highlight: "rgb(7 169 241)",
				background: "rgb(202 236 251)"
			},
			{
				highlight: "rgb(204 110 226)",
				background: "rgb(236 214 243)"
			},
			{
				highlight: "rgb(30 192 194)",
				background: "rgb(206 240 240)"
			},
			{
				highlight: "rgb(238 69 105)",
				background: "rgb(251 216 223)"
			}],
			user: props.user,
			isLoading: true
		};
	}
	
	componentDidMount() {
		fetch(`http://workout.beynum.com/api/homeload`, { credentials: "include" })
			.then(response => response.json())
			.then(data => {
				
				const weeks = (new Array(4))
					.fill({ })
					.map((item, index) => {
						let week = new Date();
						week.setHours(0,0,0,0);
						week.setDate(week.getDate() - week.getDay() - (index * 7));
						
						return week;
					})
					.sort((weekA, weekB) => weekB - weekA);
				
				let workouts = data.workouts
					.map((workout, workoutIndex) => ({
						...workout,
						color: this.state.palette[workoutIndex % this.state.palette.length],
						isVisible: false,
						lastRun: workout.activities.map(activity => new Date(activity)).sort((activityA,activityB) => activityB - activityA)[0] || null,
						activityWeeks: weeks.map((week, weekIndex, weekArray) => ({
							week: (week.getMonth() + 1) + "/" + week.getDate(),
							days: Array(7).fill({ }).map((day, dayIndex) => {
								const today = new Date();
								
								today.setHours(0,0,0,0);
								
								day = new Date(week);
								day.setDate(day.getDate() + dayIndex);
								
								return {
									day: day,
									isToday: +day === +today,
									didWorkout: workout.activities.some(activity => {
											const activityDate = new Date(activity);
											
											activityDate.setHours(0,0,0,0);
											
											return +activityDate === +day;
										}),
									};
								})
							}))
						}))
					.sort((workoutA, workoutB) => workoutB.lastRun - workoutA.lastRun);
				
				workouts = workouts.map(workout => ({
					...workout,
					lastRunDisplay: workout.lastRun ? Math.ceil(((new Date()) - workout.lastRun) / (1000 * 60 * 60 * 24)) + " day(s) ago" : "N/A"
				}));
				
				this.setState({
					isLoading: false,
					workouts: workouts
				});
				
			});
	}
	
	viewWorkout = workoutIndex => event => {
		
		this.setState(({workouts}) => ({
			workouts: workouts.map((workout, index) => ({ ...workout, isVisible: index === workoutIndex ? !workout.isVisible : false }))
		}));
		
	}
	
	render() {
		return (
			<div className="page">
				<h1>Welcome { this.state.user.firstName }</h1>
				
				{
				this.state.isLoading ?
					<div className="loading">
						<img alt="Loading" src={loadingImage} />
						<div>Loading...</div>
					</div>
				:
					<div className="workoutsContainer">
						
					{
					this.state.workouts.map((workout, workoutIndex) => (
						
						<div key={workoutIndex} className="workoutContainer" style={{ borderColor: workout.color.highlight, boxShadow: "0px 1px 3px 1px " + workout.color.background }}>
							<div className="headerContainer">
								<div className="itemBar" style={{ backgroundColor: workout.color.highlight }}></div>
								
								<div className="dataContainer">
									<div className="workoutHeader">{ workout.name }</div>
									<div className="workoutSubHeader">
										Sets: { workout.setCount } • Last: { workout.lastRunDisplay }
									</div>
								</div>
								
								<div className="actionButton" onClick={ this.viewWorkout(workoutIndex) }>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" style={{ fill: workout.color.highlight }}>
										<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
									</svg>
								</div>
								
								<div className="actionButton" onClick={this.props.startWorkout.bind(this, workout.id)}>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" style={{ fill: workout.color.highlight }}>
										<path d="M8 5v14l11-7z"/>
									</svg>
								</div>
							</div>
							
							<div className={`detailContainer ${ workout.isVisible ? "active" : "" }`}>
								
								<div className="exerciseTable" style={{ color: workout.color.highlight, backgroundColor: workout.color.background }}>
								{
								workout.exercises.map((exercise, exerciseIndex) => (
									<div key={ exerciseIndex }>{ exerciseIndex + 1 }. { exercise }</div>
								))
								}
								</div>
								
								<table className="scheduleTable">
								<tbody>
								<tr>
									<th></th>
									<th>S</th>
									<th>M</th>
									<th>T</th>
									<th>W</th>
									<th>T</th>
									<th>F</th>
									<th>S</th>
								</tr>
								{
								workout.activityWeeks.map((week, weekIndex) => (
									<tr key={ weekIndex }>
										<td>{ week.week }</td>
										{
										week.days.map((day, dayIndex) => (
											<td key={dayIndex} style={{ color: workout.color.highlight }}>
												<div className={`${ day.isToday ? "today" : "" }`} style={{ backgroundColor: day.isToday ? workout.color.highlight : null }}>{ day.didWorkout ? "•" : "" }</div>
											</td>
										))
										}
									</tr>
								))
								}
								</tbody>
								</table>
								
							</div>
						</div>
						
					))
					}
						
					</div>
				}
			</div>
		);
	}
}

export default Home;
