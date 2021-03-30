// eslint-disable-next-line
/* global fetch */

import React from "react";
import "./workout.css";
import loadingImage from "../media/loading.gif";

class Workout extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			isLoading: true,
			isEditMode: false,
			workouts: [],
			exercises: []
		};
	}
	
	getWeights = (totalWeight, exercise) => {
		let weights = {};
		
		totalWeight -= exercise.hasBar ? 45 : 0;
		
		weights.has45 = totalWeight >= 45 * 2;
		totalWeight -= totalWeight >= 45 * 2 ? 45 * 2 : 0;
		
		weights.has25 = totalWeight >= 25 * 2;
		totalWeight -= totalWeight >= 25 * 2 ? 25 * 2 : 0;
		
		weights.has10 = totalWeight >= 10 * 2;
		totalWeight -= totalWeight >= 10 * 2 ? 10 * 2 : 0;
		
		weights.has5 = totalWeight >= 5 * 2;
		totalWeight -= totalWeight >= 5 * 2 ? 5 * 2 : 0;
		
		weights["has2.5"] = totalWeight >= 2.5 * 2;
		totalWeight -= totalWeight >= 2.5 * 2 ? 2.5 * 2 : 0;
		
		return weights;
	}
	
	componentDidMount() {
		fetch(`http://${process.env.REACT_APP_API_HOST}/api/workoutload`, { credentials: "include" })
			.then(response => response.json())
			.then(data => {
				
				let workouts = data.workouts.map(workout => ({
					...workout,
					activityDays: workout.activityDays
						.reduce((days, activityDay) => {
							days[(new Date(activityDay)).getDay()] += 1;
							return days;
						}, [0, 0, 0, 0, 0, 0, 0]),
					sets: workout.sets.map(setItem => ({
						...setItem,
						...this.getWeights(setItem.goalWeight, setItem.exercise)
					}))
				}));
				
				this.setState({
					exercises: data.exercises.sort((first, second) => first.name > second.name ? 1 : -1),
					workouts: workouts,
					isLoading: false
				});
			})
			.catch(error => {
				console.warn(error);
				this.props.toast("Error loading workouts", true);
			});
	}
	
	selectWorkout = workoutIndex => event => {
		this.setState(({workouts}) => ({
			workouts: workouts.map((workout, itemIndex) => ({
				...workout,
				isHidden: itemIndex === workoutIndex ? false : true,
				isEdit: itemIndex === workoutIndex ? true : false,
			})),
			isEditMode: true
		}));
	}
	
	addWorkout = event => {
		let newWorkout = { 
			name: "New Workout"
		};
		
		fetch(`http://${process.env.REACT_APP_API_HOST}/api/workoutsave`, { method: "post", headers: {"Content-Type": "application/json"}, credentials: "include", body: JSON.stringify({ workout: newWorkout }) })
			.then(response => response.json())
			.then(data => {
				newWorkout.id = data.id;
				newWorkout.sets = [];
				
				this.setState(({workouts}) => ({
					workouts: [...workouts, newWorkout]
				}));
				
				this.props.toast("Workout created");
			})
			.catch(error => {
				console.warn(error);
				this.props.toast("Error adding workout", true);
			});
		
	}
	
	deleteWorkout = workoutIndex => event => {
		fetch(`http://${process.env.REACT_APP_API_HOST}/api/workoutdelete?id=${this.state.workouts[workoutIndex].id}`, { credentials: "include" })
			.then(response => response.json())
			.then(data => {
				this.setState(({workouts}) => ({
					workouts: [
						...workouts.slice(0, workoutIndex),
						...workouts.slice(workoutIndex + 1)
						]
				}));
				
				this.props.toast("Workout deleted");
			})
			.catch(error => {
				console.warn(error);
				this.props.toast("Error deleting workout", true);
			});
		
	}
	
	saveWorkout = workoutIndex => event => {
		fetch(`http://${process.env.REACT_APP_API_HOST}/api/workoutsave`, { method: "post", headers: {"Content-Type": "application/json"}, credentials: "include", body: JSON.stringify({ workout: this.state.workouts[workoutIndex] }) })
			.then(response => response.json())
			.then(data => {
				this.setState(({workouts}) => ({
					workouts: workouts.map((workout, itemIndex) => ({
						...workout,
						isHidden: false,
						isEdit: false,
					})),
					isEditMode: false
				}),
				() => { this.props.toast("Workout saved"); }
				);
			})
			.catch(error => {
				console.warn(error);
				this.props.toast("Error updating workout", true);
			});
	}
	
	changeName = workoutIndex => event => {
		this.setState(({workouts}) => ({
			workouts: [
				...workouts.slice(0, workoutIndex),
				{
					...workouts[workoutIndex],
					name: event.target.value
				},
				...workouts.slice(workoutIndex + 1)
				]
		}));
	}
	
	addSet = workoutIndex => event => {
		this.setState(({workouts}) => ({
			workouts: [
				...workouts.slice(0, workoutIndex),
				{
					...workouts[workoutIndex],
					sets: [
						...workouts[workoutIndex].sets,
						{
							exercise: null,
							goalReps: 0,
							goalWeight: 0,
							rest: 0
						}
						]
				},
				...workouts.slice(workoutIndex + 1)
				]
		}));
	}
	
	changeExercise = (workoutIndex, setIndex) => event => {
		const setExercise = this.state.exercises.find(exercise => exercise.name === event.target.value);
		
		let newWeight;
		if (!setExercise.hasWeight) {
			newWeight = 0;
		}
		else if (this.state.workouts[workoutIndex].sets[setIndex].goalWeight > 0) {
			newWeight = this.state.workouts[workoutIndex].sets[setIndex].goalWeight;
		}
		else if (setExercise.hasBar) {
			newWeight = 45;
		}
		else {
			newWeight = 0;
		}
		
		this.setState(({workouts}) => ({
			workouts: [
				...workouts.slice(0, workoutIndex),
				{
					...workouts[workoutIndex],
					sets: [
						...workouts[workoutIndex].sets.slice(0, setIndex),
						{
							...workouts[workoutIndex].sets[setIndex],
							exercise: setExercise,
							goalWeight: newWeight,
							...this.getWeights(newWeight, setExercise)
						},
						...workouts[workoutIndex].sets.slice(setIndex + 1)
						]
				},
				...workouts.slice(workoutIndex + 1)
				]
		}));
	}
	
	editRep = (workoutIndex, setIndex, newReps) => {
		this.setState(({workouts}) => ({
			workouts: [
				...workouts.slice(0, workoutIndex),
				{
					...workouts[workoutIndex],
					sets: [
						...workouts[workoutIndex].sets.slice(0, setIndex),
						{
							...workouts[workoutIndex].sets[setIndex],
							goalReps: newReps
						},
						...workouts[workoutIndex].sets.slice(setIndex + 1)
						]
				},
				...workouts.slice(workoutIndex + 1)
				]
		}));
	}
	
	editRest = (workoutIndex, setIndex, newRest) => {
		this.setState(({workouts}) => ({
			workouts: [
				...workouts.slice(0, workoutIndex),
				{
					...workouts[workoutIndex],
					sets: [
						...workouts[workoutIndex].sets.slice(0, setIndex),
						{
							...workouts[workoutIndex].sets[setIndex],
							rest: newRest
						},
						...workouts[workoutIndex].sets.slice(setIndex + 1)
						]
				},
				...workouts.slice(workoutIndex + 1)
				]
		}));
	}
	
	changeWeight = (workoutIndex, setIndex, weightChange) => {
		const setItem = this.state.workouts[workoutIndex].sets[setIndex];
		const newWeight = setItem.goalWeight + (setItem["has" + weightChange] ? (weightChange * 2) * -1 : weightChange * 2);
		
		this.setState(({workouts}) => ({
			workouts: [
				...workouts.slice(0, workoutIndex),
				{
					...workouts[workoutIndex],
					sets: [
						...workouts[workoutIndex].sets.slice(0, setIndex),
						{
							...workouts[workoutIndex].sets[setIndex],
							...this.getWeights(newWeight, setItem.exercise),
							goalWeight: newWeight
						},
						...workouts[workoutIndex].sets.slice(setIndex + 1)
						]
				},
				...workouts.slice(workoutIndex + 1)
				]
		}));
	}
	
	render() {
		return (
			<div className="page workoutPage">
				<h1 className={this.state.isEditMode ? "hidden" : ""}>My Workouts</h1>
				
				{
				this.state.isLoading ?
					<div className="loading">
						<img alt="Loading" src={loadingImage} />
						<div>Loading...</div>
					</div>
				:
					<div className="workoutCards">
					{
						this.state.workouts.map((workout, workoutIndex) => (
						<div key={workoutIndex}>
							<div className={`workoutCard ${ workout.isHidden ? "" : "active" }`}>
								<div className="cardContent">
									<div className="cardDetails">
										<div className="cardHeader">
											{
											workout.isEdit ?
											
											<input type="text" value={workout.name} onChange={this.changeName(workoutIndex)} />
											
											:workout.name
											}
										</div>
										
										<div className="cardSubHeader">
											<div className="label">Last Workout </div>
											<div className="data">{workout.lastWorkout ? workout.lastWorkout.toDateString() : "Not Started"}</div>
										</div>
										<div className="cardSubHeader">
											<div className="label">Sets</div>
											<div className="data">{workout.sets.length}</div>
											<div className="label">&nbsp;&bull;&nbsp;Reps</div>
											<div className="data">{workout.sets.reduce((total, current) => total + current.goalReps, 0)}</div>
										</div>
									</div>
								
									<div className="cardAction">
										{ workout.isEdit ?
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={this.saveWorkout(workoutIndex) }>
											<path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
										</svg>
										:
										<div className="actions">
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={this.props.startActivity.bind(this, workout.id)}>
												<path d="M8 5v14l11-7z"/>
											</svg>
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={this.selectWorkout(workoutIndex)}>
												<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
											</svg>
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={this.deleteWorkout(workoutIndex)}>
												<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
											</svg>
										</div>
										}
									</div>
								</div>
								
								<div className="timelineContainer">
									<div className="timelineDate">
										<div className="timelineCount">{ workout.activityDays[0] || "•" }</div>
										<div className="timelineDay">Sun</div>
									</div>
									<div className="timelineDate">
										<div className="timelineCount">{ workout.activityDays[1] || "•" }</div>
										<div className="timelineDay">Mon</div>
									</div>
									<div className="timelineDate">
										<div className="timelineCount">{ workout.activityDays[2] || "•" }</div>
										<div className="timelineDay">Tue</div>
									</div>
									<div className="timelineDate">
										<div className="timelineCount">{ workout.activityDays[3] || "•" }</div>
										<div className="timelineDay">Wed</div>
									</div>
									<div className="timelineDate">
										<div className="timelineCount">{ workout.activityDays[4] || "•" }</div>
										<div className="timelineDay">Thu</div>
									</div>
									<div className="timelineDate">
										<div className="timelineCount">{ workout.activityDays[5] || "•" }</div>
										<div className="timelineDay">Fri</div>
									</div>
									<div className="timelineDate">
										<div className="timelineCount">{ workout.activityDays[6] || "•" }</div>
										<div className="timelineDay">Sat</div>
									</div>
								</div>
							</div>
							
							<div className={`setsList ${ workout.isEdit ? "active" : "" }`}>
								{
								workout.sets.map((setItem, setIndex) => (
								<div key={setIndex} className="setContainer">
									<div className="setTimeline">
										<div className={`timelineLine ${ setIndex === 0 ? "hidden" : "" }`}></div>
										<div className="setNumber">{setIndex + 1}</div>
										<div className="timelineLine"></div>
									</div>
									
									<div className="setDetails">
										<div className="setName">
											<select value={ setItem.exercise ? setItem.exercise.name : "" } onChange={this.changeExercise(workoutIndex, setIndex)}>
												<option value="">Select Exercise</option>
												{
												this.state.exercises.map((exercise, exerciseIndex) => (
													<option key={exerciseIndex} value={exercise.name}>{exercise.name}</option>
												))
												}
											</select>
										</div>
										
										<div className="setSettings">
											<div className="repsContainer">
												<div className="reps">
													<div className="editButton" onClick={() => { this.editRep(workoutIndex, setIndex, setItem.goalReps - 1) }}>-</div>
													<div className="repsNumber">{setItem.goalReps}</div>
													<div className="editButton" onClick={() => { this.editRep(workoutIndex, setIndex, setItem.goalReps + 1) }}>+</div>
												</div>
												<div>Reps</div>
											</div>
											
											<div className={`weightContainer ${ setItem.exercise && setItem.exercise.hasWeight ? "" : "hidden" }`}>
												<div className="weights">
													<div className={`weight ${ setItem.has45 ? "active" : "" } `} onClick={() => { this.changeWeight(workoutIndex, setIndex, 45) }}>45</div>
													<div className={`weight ${ setItem.has25 ? "active" : "" } `} onClick={() => { this.changeWeight(workoutIndex, setIndex, 25) }}>25</div>
													<div className={`weight ${ setItem.has10 ? "active" : "" } `} onClick={() => { this.changeWeight(workoutIndex, setIndex, 10) }}>10</div>
													<div className={`weight ${ setItem.has5 ? "active" : "" } `} onClick={() => { this.changeWeight(workoutIndex, setIndex, 5) }}>5</div>
													<div className={`weight ${ setItem["has2.5"] ? "active" : "" } `} onClick={() => { this.changeWeight(workoutIndex, setIndex, 2.5) }}>2.5</div>
												</div>
												<div>{setItem.goalWeight}lbs</div>
											</div>
										</div>
										
										<div className="restContainer">
											<div className="restLine"></div>
											
											<div className="editButton" onClick={() => { this.editRest(workoutIndex, setIndex, setItem.rest - 60) }}>-</div>
											<div className="restNumber">{setItem.rest / 60}</div>
											<div className="editButton" onClick={() => { this.editRest(workoutIndex, setIndex, setItem.rest + 60) }}>+</div>
											
											<div className="restLine"></div>
										</div>
									</div>
								</div>
								))
								}
								
								<div className="setContainer">
									<div className="setTimeline">
										<div className="timelineLine"></div>
										<div className="setNumber" style={{cursor: "pointer"}} onClick={this.addSet(workoutIndex)}>+</div>
									</div>
								</div>
								
							</div>
						</div>
						))
						
					}
						
						<div className={`workoutCard ${ this.state.isEditMode ? "" : "active" }`}>
							<div className="addWorkout" onClick={this.addWorkout}>+</div>
						</div>
						
					</div>
				}
			</div>
		);
	}
}

export default Workout;
