import React from "react";
import "./activity.css";
import loadingImage from "../media/loading.gif";
import countdownURL from "../media/countdown.mp3";
import readyURL from "../media/getready.mp3";

class Activity extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			isLoading: true,
			workout: { id: props.workoutId }
		};
	}
	countdownAudio = new Audio(countdownURL);
	readyAudio = new Audio(readyURL);
	video = {};
	
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
		fetch("http://workout.beynum.com/workout/api/activityload?id=" + this.state.workout.id, { credentials: "include" })
			.then(response => response.json())
			.then(data => {
				let workout = data.workout;
				workout.sets = data.workout.sets.map(setItem => ({
					...setItem,
					...this.getWeights(setItem.goalWeight, setItem.exercise)
				}));
				
				this.setState({
					workout: workout,
					isLoading: false
				});
			})
			.catch(error => {
				console.warn(error);
				this.props.toast("Error loading workout", true);
			});
			
			var Util={};
			Util.base64 = function(mimeType, base64) {
				return "data:" + mimeType + ";base64," + base64;
			};
			
			this.video = document.createElement("video");
			this.video.setAttribute("loop", "");
			
			let source = document.createElement("source");
			source.src = "data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=";
			source.type = "video/webm";
			this.video.appendChild(source);
			
			// let source = document.createElement("source");
			// source.src = "data:video/mp4;AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw==";
			// source.type = "video/mp4";
			// this.video.appendChild(source);
	}
	
	componentWillUnmount() {
		if (this.state.workoutInterval) {
			clearInterval(this.state.workoutInterval);
		}
	}
	
	startActivity = () => {
		this.setState(({workout}) => ({
			activity: {
				workoutId: this.state.workout.id,
				runDate: new Date(),
				sets: [],
				minElapsed: 0,
				secElapsed: 0
			},
			workout: {
				...workout,
				sets: [
					{
						...workout.sets[0],
						isActive: true
					},
					...workout.sets.slice(1)
					]
			}
		}),
		() => {
			const workoutInterval = setInterval(this.updateTime, 1000);
			this.setState({ workoutInterval: workoutInterval });
		}
		);
	}
	
	startSet = newSetIndex => event => {
		this.setState(({workout}) => ({
			workout: {
				...workout,
				sets: workout.sets.map((setItem, setIndex) => ({
					...setItem,
					isRest: false,
					isActive: newSetIndex === setIndex ? true : false
				}))
			}
		}));
	}
	
	editRep = (setIndex, newReps) => {
		this.setState(({workout}) => ({
			workout: {
				...workout,
				sets: [
					...workout.sets.slice(0, setIndex),
					{
						...workout.sets[setIndex],
						goalReps: newReps
					},
					...workout.sets.slice(setIndex + 1)
					]
			}
		}));
	}
	
	editWeight = (setIndex, newWeight) => {
		const setItem = this.state.workout.sets[setIndex];
		const updateWeight = setItem.goalWeight + (setItem["has" + newWeight] ? (newWeight * 2) * -1 : newWeight * 2);
		
		this.setState(({workout}) => ({
			workout: {
				...workout,
				sets: [
					...workout.sets.slice(0, setIndex),
					{
						...workout.sets[setIndex],
						goalWeight: updateWeight,
						...this.getWeights(updateWeight, setItem.exercise)
					},
					...workout.sets.slice(setIndex + 1)
					]
			}
		}));
	}
	
	setComplete = setIndex => event => {
		const updateSets = this.state.activity.sets;
		
		if (updateSets.some(setItem => setItem.id === this.state.workout.sets[setIndex].id)) {
			// Update set
			const updateSet = updateSets.find(setItem => setItem.id === this.state.workout.sets[setIndex].id);
			updateSet.reps = this.state.workout.sets[setIndex].goalReps;
			updateSet.weight = this.state.workout.sets[setIndex].goalWeight;
		}
		else {
			// Add set
			updateSets.push({
				id: this.state.workout.sets[setIndex].id,
				exercise: this.state.workout.sets[setIndex].exercise,
				reps: this.state.workout.sets[setIndex].goalReps,
				weight: this.state.workout.sets[setIndex].goalWeight
			});
		}
		
		this.setState(({activity, workout}) => ({
			activity: {
				...activity,
				sets: updateSets
			},
			workout: {
				...workout,
				sets: [
					...workout.sets.slice(0, setIndex),
					{
						...workout.sets[setIndex],
						isComplete: true,
						isActive: false,
						isRest: setIndex < workout.sets.length ? true : false,
						restMin: setIndex < workout.sets.length ? Math.floor(workout.sets[setIndex].rest / 60) : 0,
						restSec: setIndex < workout.sets.length ? Math.floor(workout.sets[setIndex].rest % 60) : 0
					},
					...workout.sets.slice(setIndex + 1)
					]
			},
			playReady: true,
			playCountdown: true
		}));
		
		this.video.play();
	}
	
	deleteSet = setDeleteIndex => event => {
		this.setState(({workout, activity}) => ({
			workout: {
				...workout,
				sets: workout.sets.filter((setItem, setIndex) => setIndex !== setDeleteIndex)
			},
			activity: {
				...activity,
				sets: activity.sets.filter(setItem => setItem.id !== this.state.workout.sets[setDeleteIndex].id)
			}
		}));
	}
	
	saveActivity = event => {
		fetch("http://workout.beynum.com/workout/api/activitysave", { method: "post", headers: {"Content-Type": "application/json"}, credentials: "include", body: JSON.stringify({ activity: this.state.activity }) })
			.then(response => response.json())
			.then(data => {
				this.props.activityComplete();
			})
			.catch(error => {
				console.warn(error);
				this.props.toast("Error updating workout", true);
			});
	}
	
	updateTime = () => {
		this.setState(({activity}) => ({
			activity: {
				...activity,
				minElapsed: Math.floor((Date.now() - this.state.activity.runDate) / 1000 / 60),
				secElapsed: Math.floor(((Date.now() - this.state.activity.runDate) / 1000) % 60)
			}
		}));
		
		const activeSetIndex = this.state.workout.sets.findIndex(setItem => setItem.isRest);
		
		if (activeSetIndex >= 0) {
			let updateMin = this.state.workout.sets[activeSetIndex].restMin;
			let updateSec = this.state.workout.sets[activeSetIndex].restSec;
			
			if (updateSec > 0) {
				updateSec--;
			}
			else if (updateMin > 0) {
				updateMin--;
				updateSec = 59;
			}
			
			if (updateMin <= 0 && updateSec <= 0) {
				this.setState(({workout}) => ({
					workout: {
						...workout,
						sets: workout.sets.map((setItem, setIndex) => ({
							...setItem,
							isRest: false,
							isActive: setIndex === activeSetIndex + 1 ? true : false
						}))
					}
				}));
				
				this.video.pause();
			}
			else if (this.state.playReady && updateMin <= 0 && updateSec < 30 && updateSec >= 28) {
				this.readyAudio.play();
				this.setState({ playReady: false });
			}
			else if (this.state.playCountdown && updateMin <= 0 && updateSec <= 3) {
				this.countdownAudio.play();
				this.setState({ playCountdown: false });
			}
			else {
				this.setState(({workout}) => ({
					workout: {
						...workout,
						sets: [
							...workout.sets.slice(0, activeSetIndex),
							{
								...workout.sets[activeSetIndex],
								restMin: updateMin,
								restSec: updateSec
							},
							...workout.sets.slice(activeSetIndex + 1)
							]
					}
				}));
			}
		}
		
	}
	
	render() {
		return (
			<div className="page activityPage">
			{
			this.state.isLoading ?
				<div className="loading">
					<img alt="Loading" src={loadingImage} />
					<div>Loading...</div>
				</div>
			:
				<div>
					<div className="activityCard">
						<div className="cardContent">
							<div className="cardHeader">{this.state.workout.name}</div>
							
							<div className="cardInfo">
								<div>time</div>
								<div className="cardData">
									{
										this.state.activity ? this.state.activity.minElapsed + " min " + this.state.activity.secElapsed + " sec"
										: "Not Started"
									}
								</div>
							</div>
							
							<div className="cardInfo">
								<div>sets remain</div>
								<div className="cardData">
									{
										this.state.activity ? this.state.workout.sets.length - this.state.activity.sets.length
										: "Not Started"
									}
								</div>
							</div>
						</div>
							
						<div className="cardRemaining">
							{ 
							this.state.activity && this.state.activity.sets.length === this.state.workout.sets.length ?
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="workoutAction" onClick={this.saveActivity}>
									<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
								</svg>
							: this.state.activity ?
								<svg viewBox="0 0 42 42">
									<circle className="setsSegment" cx="21" cy="21" r="15.91549430918954" strokeWidth="2" 
										strokeDasharray={
											(100 - Math.round((this.state.activity.sets.length / this.state.workout.sets.length) * 100)) + " " +
											Math.round((this.state.activity.sets.length / this.state.workout.sets.length) * 100)
										}
										strokeDashoffset="25">
									</circle>
									
									<text x="21" y="26" textAnchor="middle">{100 - (this.state.activity.sets.length > 0 ? Math.round((this.state.activity.sets.length / this.state.workout.sets.length) * 100) : 0) }</text>
								</svg>
							:
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="workoutAction" onClick={this.startActivity}>
									<path d="M8 5v14l11-7z"/>
								</svg>
							}
						</div>
					</div>
					
					{
					this.state.workout.sets.map((setItem, setIndex) => (
					<div key={setIndex} className="cardContainer" >
						<div className="setContainer">
							<div className="setTimeline">
								<div className={`timelineLine ${ setIndex === 0 ? "hidden" : "" }`}></div>
								<div className="setNumber">{setIndex + 1}</div>
								{ setIndex < this.state.workout.sets.length - 1 && <div className="timelineLine"></div> }
							</div>
							
							{
							setItem.isActive ?
							<div className="setCard active">
								<div className="setCardContainer">
									<div className="setNameActive">{ setItem.exercise.name }</div>
									
									{
									setItem.maxSet &&
									<div>
										<div className="row">
											max
											<div className="cardData">{ setItem.maxSet ? (new Date(setItem.maxSet.runDate)).toDateString() : "" }</div>
										</div>
										<div className="row">
											reps
											<div className="cardData">{ setItem.maxSet.reps }</div>
											
											{ setItem.exercise.hasWeight &&
											<div className="row">
												&nbsp;weight
												<div className="cardData">{ setItem.maxSet.weight }</div>
												&nbsp;1rm
												<div className="cardData">{ setItem.maxSet.oneRepMax }</div>
											</div>
											}
										</div>
									</div>
									}
									
									<div className="repsContainerActive">
										<div className="repsActive">
											<div className="editButton" onClick={ () => { this.editRep(setIndex, setItem.goalReps - 1) } }>-</div>
											<div className="repsNumber">{setItem.goalReps}</div>
											<div className="editButton" onClick={ () => { this.editRep(setIndex, setItem.goalReps + 1) } }>+</div>
										</div>
										<div>Reps</div>
									</div>
									
									{
									setItem.exercise && setItem.exercise.hasWeight &&
									<div className="weightContainerActive">
										<div className="weightsActive">
											<div className={`weightActive ${ setItem.has45 ? "active" : "" } `} onClick={ () => { this.editWeight(setIndex, 45) } }>45</div>
											<div className={`weightActive ${ setItem.has25 ? "active" : "" } `} onClick={ () => { this.editWeight(setIndex, 25) } }>25</div>
											<div className={`weightActive ${ setItem.has10 ? "active" : "" } `} onClick={ () => { this.editWeight(setIndex, 10) } }>10</div>
											<div className={`weightActive ${ setItem.has5 ? "active" : "" } `} onClick={ () => { this.editWeight(setIndex, 5) } }>5</div>
											<div className={`weightActive ${ setItem["has2.5"] ? "active" : "" } `} onClick={ () => { this.editWeight(setIndex, 2.5) } }>2.5</div>
										</div>
										
										<div className="weightInfo">
											<div>
												weight { setItem.goalWeight } lbs
											</div>
										</div>
									</div>
									}
								</div>
								
								<div className="setActionActive">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={this.setComplete(setIndex)}>
										<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
									</svg>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={this.deleteSet(setIndex)}>
										<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
									</svg>
								</div>
							</div>
							:
							<div className="setCard">
								<div className="setCardContainer">
									<div className="setName">{ setItem.exercise.name }</div>
									
									<div className="cardInfo">
										<div>reps</div>
										<div className="cardData">
											{ 
											this.state.activity && this.state.activity.sets.length >= setIndex && this.state.activity.sets.length < setIndex ? this.state.activity.sets[setIndex].reps : setItem.goalReps
											}
										</div>
									</div>
									
									{ setItem.exercise && setItem.exercise.hasWeight &&
									<div>
										<div className="cardInfo">
											<div>weight</div>
											<div className="cardData">
											{ 
												this.state.activity && this.state.activity.sets.length >= setIndex && this.state.activity.sets.length < setIndex ? this.state.activity.sets[setIndex].weight : setItem.goalWeight
											} lbs
											</div>
										</div>
										
										<div className="cardInfo">
											<div className={`weight ${ setItem.has45 ? "active" : "" } `}>45</div>
											<div className={`weight ${ setItem.has25 ? "active" : "" } `}>25</div>
											<div className={`weight ${ setItem.has10 ? "active" : "" } `}>10</div>
											<div className={`weight ${ setItem.has5 ? "active" : "" } `}>5</div>
											<div className={`weight ${ setItem["has2.5"] ? "active" : "" } `}>2.5</div>
										</div>
									</div>
									}
								</div>
								
								<div className={`setAction ${ setItem.isComplete ? "complete" : "" }`}>
									{ 
									setItem.isComplete ?
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={this.startSet(setIndex)}>
											<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
										</svg>
									: this.state.activity ?
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" onClick={this.startSet(setIndex)}>
											<path d="M8 5v14l11-7z"/>
										</svg>
									: 
										<div></div>
									}
								</div>
							</div>
							}
						</div>
						
						{
						setIndex < this.state.workout.sets.length - 1 &&
						<div className="setContainer">
							<div className="setTimeline">
								<div className="timelineLine"></div>
								<div className="timeLineRest"></div>
								<div className="timelineLine"></div>
							</div>
							
							{
							setItem.isRest ?
							<div className="restContainerActive">
								<div className="restCountdown">
									<svg viewBox="0 0 42 42">
										<circle className="restSegment" cx="21" cy="21" r="15.91549430918954" strokeDashoffset="25"
										strokeDasharray={
											Math.round((((setItem.restMin * 60) + setItem.restSec) / setItem.rest) * 100) + " " +
											(100 - Math.round((((setItem.restMin * 60) + setItem.restSec) / setItem.rest) * 100))
										}>
										</circle>
										
										<text x="19" y="25" textAnchor="end">{ (setItem.restMin < 10 ? "0" : "") + setItem.restMin }</text>
										<text x="21" y="25" textAnchor="middle">:</text>
										<text x="23" y="25" textAnchor="start">{ (setItem.restSec < 10 ? "0" : "") + setItem.restSec }</text>
									</svg>
								</div>
							</div>
							:
							<div className="restContainer">
								<div className="restLine"></div>
								<div className="restNumber">{setItem.rest / 60}</div>
								<div className="restLine"></div>
							</div>
							}
						</div>
						}
						
					</div>
					))
					}
				</div>
			}
			</div>
		);
	}
}

export default Activity;
