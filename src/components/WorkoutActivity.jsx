// eslint-disable-next-line
/* global fetch */

import React from "react";
import "./workoutactivity.css";
import loadingImage from "../media/loading.gif";
import countdownURL from "../media/countdown.mp3";
import readyURL from "../media/getready.mp3";

class WorkoutActivity extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			isLoading: true,
			isSaving: false,
			countDown: { min: 0, sec: 0, startTime: new Date() },
			workout: { id: this.props.workoutId }
		};
	
	}
	
	countdownAudio = new Audio(countdownURL);
	readyAudio = new Audio(readyURL);
	video = {};
	
	componentDidMount() {
		
		fetch(`http://workout.beynum.com/api/activityload?id=${this.state.workout.id}`, { credentials: "include" })
			.then(response => response.json())
			.then(data => {
				const workout = data.workout;
				
				let exercises = data.exercises.map(exercise => {
					const series = [...new Set(exercise.activities.map(activity => exercise.hasWeight ? activity.weight : activity.reps))]
							.map(category => ({
								value: category,
								activities: exercise.activities
									.filter(activity => exercise.hasWeight ? activity.weight === category : activity.reps === category),
								lastRun: exercise.activities
									.filter(activity => exercise.hasWeight ? activity.weight === category : activity.reps === category)
									.map(activity => new Date(activity.runDate))
									.sort((activityA, activityB) => activityB - activityA)[0]
							}))
							.sort((categoryA, categoryB) => +categoryB.lastRun - categoryA.lastRun)
							.slice(0, 5),
						maxActivities = Math.max(...series.map(category => category.activities.length));
					
						
					const graphSize = { width: 350, height: 200 },
						padding = { top: 20, bottom: 15 },
						graphArea = { width: graphSize.width, height: graphSize.height - padding.top - padding.bottom },
						seriesWidth = graphArea.width / series.length;

					return {
						...exercise,
						graph: {
							maxActivities: maxActivities,
							graphSize: graphSize,
							graphBars: series.map((series, seriesIndex) => ({
									value: series.value,
									totalActivities: series.activities.length,
									lastRun: (series.lastRun.getMonth() + 1) + "/" + series.lastRun.getDate(),
									center: (seriesWidth * seriesIndex) + (seriesWidth / 2),
									top: (graphArea.height + padding.top) - ((series.activities.length * graphArea.height) / maxActivities),
									bottom: graphSize.height - padding.bottom
								}))
						}
					};
				});
				
				workout.sets = workout.sets.map(workoutSet => ({
					...workoutSet,
					...this.getWeights(workoutSet.exercise.maxWeight, workoutSet.exercise),
					reps: workoutSet.exercise.maxReps || 0,
					weight: workoutSet.exercise.maxWeight || 0,
					exercise: exercises.find(exercise => exercise.name === workoutSet.exercise.name)
				}));
				
				this.setState({
					workout: workout,
					exercises: exercises,
					isLoading: false
				});
			});
		
		let Util={};
		Util.base64 = function(mimeType, base64) {
			return "data:" + mimeType + ";base64," + base64;
		};
		
		this.video = document.createElement("video");
		this.video.setAttribute("loop", "");
		
		let source = document.createElement("source");
		source.src = "data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=";
		source.type = "video/webm";
		this.video.appendChild(source);
		
		let source2 = document.createElement("source");
		source2.src = "data:video/mp4;AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw==";
		source2.type = "video/mp4";
		this.video.appendChild(source2);
		
	}

	componentWillUnmount() {
		if (this.state.restInterval) {
			this.video.pause();
			clearInterval(this.state.restInterval);
		}
	}
	
	completeSet = setIndex => {
		if (this.state.restInterval) {
			this.video.pause();
			clearInterval(this.state.restInterval);
		}
		
		this.setState(({workout}) => ({
			workout: {
				...workout,
				sets: workout.sets.map((workoutSet, mapIndex) => ({
						...workoutSet,
						isComplete: mapIndex === setIndex ? true : workoutSet.isComplete,
						isRest: mapIndex === setIndex ? true : false,
					}))
				},
			countDown: { 
				min: setIndex < workout.sets.length ? Math.floor(workout.sets[setIndex].rest / 60) : 0,
				sec: setIndex < workout.sets.length ? Math.floor(workout.sets[setIndex].rest % 60) : 0,
				startTime: new Date(),
				restTime: workout.sets[setIndex].rest,
				canPlayReady: true,
				canPlayCountdown: true
			}
		}),
		() => {
			let restInterval = setInterval(this.updateTime, 1000);
			this.setState({ restInterval: restInterval });
			this.video.play();
		});
	}
	
	deleteSet = setIndex => {
		this.setState(({workout}) => ({
			workout: {
				...workout,
				sets: [
					...workout.sets.slice(0, setIndex),
					...workout.sets.slice(setIndex + 1)
				]
			}
		}));
	}
	
	addSet = setIndex => {
		const exercise = this.state.exercises[0],
			newSet = {
				exercise: exercise,
				reps: exercise.maxReps || 0,
				weight: exercise.maxWeight || 0,
				...this.getWeights(exercise.maxWeight || 0, exercise),
			};
		
		this.setState(({workout}) => ({
			workout: {
				...workout,
				sets: [
					...workout.sets.slice(0, setIndex + 1),
					newSet,
					...workout.sets.slice(setIndex + 1)
				]
			}
		}));
		
	}
	
	changeExercise = setIndex => event => {
		const exercise = this.state.exercises.find(exercise => exercise.name === event.target.value);
		
		this.setState(({workout}) => ({
			workout: {
				...workout,
				sets: [
					...workout.sets.slice(0, setIndex),
					{
						...workout.sets[setIndex],
						reps: exercise.maxReps || 0,
						weight: exercise.maxWeight || 0,
						exercise: exercise
					},
					...workout.sets.slice(setIndex + 1)
				]
			}
		}));
	}
	
	saveActivity = () => {
		if (this.state.isSaving) {
			return;
		}

		if (this.state.restInterval) {
			clearInterval(this.state.restInterval);
		}

		this.setState({
			isSaving: true
		},
		() => {
			const activity = {
				workoutId: this.state.workout.id,
				runDate: new Date(),
				sets: this.state.workout.sets
					.filter(workoutSet => workoutSet.isComplete)
					.map(workoutSet => ({
						exercise: {
							id: workoutSet.exercise.id,
							name: workoutSet.exercise.name,
							category: workoutSet.exercise.category
						},
						reps: workoutSet.reps,
						weight: workoutSet.weight
					}))
			};
			
			fetch(`http://workout.beynum.com/api/activitysave`, { method: "post", headers: {"Content-Type": "application/json"}, credentials: "include", body: JSON.stringify({ activity: activity }) })
				.then(response => response.json())
				.then(data => {
					this.props.activityComplete();
				})
				.catch(error => {
					console.warn(error);
					this.props.toast("Error updating workout", true);
				});
		});
	}
	
	editReps = (setIndex, newReps) => {
		this.setState(({workout}) => ({
			workout: {
				...workout,
				sets: [
					...workout.sets.slice(0, setIndex),
					{
						...workout.sets[setIndex],
						reps: newReps
					},
					...workout.sets.slice(setIndex + 1)
				]
			}
		}));
	}
	
	editWeight = (setIndex, weight) => {
		const newTotal = this.state.workout.sets[setIndex].weight + (this.state.workout.sets[setIndex]["has" + weight] ? (weight * 2) * -1 : weight * 2);
		
		this.setState(({workout}) => ({
			workout: {
				...workout,
				sets: [
					...workout.sets.slice(0, setIndex),
					{
						...workout.sets[setIndex],
						...this.getWeights(newTotal, workout.sets[setIndex].exercise),
						weight: newTotal
					},
					...workout.sets.slice(setIndex + 1)
				]
			}
		}));
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
	
	updateTime = () => {
		let sec = this.state.countDown.sec,
			min = this.state.countDown.min,
			timerDiff = this.state.countDown.restTime - ((min * 60) + sec),
			timeDiff = Math.floor((new Date() - this.state.countDown.startTime) / 1000);
		
		if (timeDiff - timerDiff > 3) {
			let remaining = this.state.countDown.restTime - timeDiff;
			min = Math.floor(remaining / 60);
			sec = Math.floor(remaining % 60);
		}

		if (sec > 0) {
			sec--;
		}
		else if (min > 0) {
			min--;
			sec = 59;
		}
		
		if (sec <= 0 && min <= 0) {
			// complete
			if (this.state.restInterval) {
				clearInterval(this.state.restInterval);
			}
			
			this.setState(({workout}) => ({
				workout: {
					...workout,
					sets: workout.sets.map(workoutSet => ({
						...workoutSet,
						isRest: false
					}))
				}
			}));
			
			this.video.pause();
		}
		else if (this.state.countDown.canPlayReady && min <= 0 && sec <= 30) {
			// Play get ready
			this.readyAudio.play();
			this.setState(({countDown}) => ({ 
				countDown: {
					...countDown,
					canPlayReady: false
				} 
			}));
		}
		else if (this.state.countDown.canPlayCountdown && min <= 0 && sec <= 3) {
			// PlayCountdown
			this.countdownAudio.play();
			this.setState(({countDown}) => ({ 
				countDown: {
					...countDown,
					canPlayCountdown: false
				} 
			}));
		}
		
		this.setState(({countDown}) => ({
			countDown: { 
				...countDown,
				min: min, 
				sec: sec 
			}
		}));
		
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
				<div className="pageContainer">
					<div className="horizontalContainer">
						
						<div 
							{...(!this.state.isSaving && this.state.workout.sets.some(workoutSet => workoutSet.isComplete) && { onClick: this.saveActivity }) } 
							className={`headerButton ${ this.state.isSaving || !this.state.workout.sets.some(workoutSet => workoutSet.isComplete) ? "disabled" : "" }`}>
							
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="workoutAction">
								<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
							</svg>
						</div>
						
						<h1>Workout { this.state.workout.name }</h1>

					</div>
					
					<div className="setsContainer">	
					{
					this.state.workout.sets.map((workoutSet, setIndex) => (
						<div key={setIndex} style={{ display: "flex" }}>
							<div className="setContainer">
								
								<div className="setHeader">
									<div className="setNameContainer">
										<div className="header">
											<select value={ workoutSet.exercise.name } onChange={ this.changeExercise(setIndex) }>
												{
												this.state.exercises.map((exercise, exerciseIndex) => (
													<option key={exerciseIndex} value={exercise.name}>{exercise.name}</option>
												))
												}
											</select>
										</div>
										<div className="subHeader">{ workoutSet.exercise.category }</div>
									</div>
									
									<div className="setNumberContainer">
										<div>{ setIndex + 1 }</div>
										<div>{ this.state.workout.sets.length }</div>
									</div>
								</div>
								
								<div className="setDataContainer">
									<div className="horizontalContainer">
										<div className="dataButton" onClick={ () => this.editReps(setIndex, workoutSet.reps - 1) }>-</div>
										<div className="dataValue">{ workoutSet.reps }</div>
										<div className="dataButton" onClick={ () => this.editReps(setIndex, workoutSet.reps + 1) }>+</div>
									</div>
									{
									workoutSet.exercise.hasWeight ? 
									<div className="horizontalContainer">
										<div className={`weightButton ${ workoutSet["has2.5"] ? "active" : "" }`} onClick={ () => this.editWeight(setIndex, 2.5) }>2.5</div>
										<div className={`weightButton ${ workoutSet["has5"] ? "active" : "" }`} onClick={ () => this.editWeight(setIndex, 5) }>5</div>
										<div className={`weightButton ${ workoutSet["has10"] ? "active" : "" }`} onClick={ () => this.editWeight(setIndex, 10) }>10</div>
										<div className={`weightButton ${ workoutSet["has25"] ? "active" : "" }`} onClick={ () => this.editWeight(setIndex, 25) }>25</div>
										<div className={`weightButton ${ workoutSet["has35"] ? "active" : "" }`} onClick={ () => this.editWeight(setIndex, 35) }>35</div>
										<div className={`weightButton ${ workoutSet["has45"] ? "active" : "" }`} onClick={ () => this.editWeight(setIndex, 45) }>45</div>
									</div>
									: ""
									}
									{
									workoutSet.exercise.hasWeight ?
									<div className="horizontalContainer">
										<div className="subHeader">{ workoutSet.weight } lbs</div>
									</div>
									: ""
									}
								</div>
								
								<div className="graphContainer">

									<svg viewBox={`0 0 ${ workoutSet.exercise.graph.graphSize.width } ${ workoutSet.exercise.graph.graphSize.height }`} className="workoutGraph">
										{
										workoutSet.exercise.graph.graphBars.map((bar, barIndex) => (
											<g key={ barIndex } transform={`translate(${ bar.center })`}>
												<line x1="0" x2="0" y1={ bar.top } y2={ bar.bottom }></line>

												<text className="seriesHeader" x="0" y={ workoutSet.exercise.graph.graphSize.height } textAnchor="middle" alignmentBaseline="baseline">{ bar.value }</text>
												<text className="seriesData" x="5" y={ bar.top } textAnchor="start" alignmentBaseline="hanging">{ bar.totalActivities }</text>
												<text className="seriesHeader" x="0" y="0" textAnchor="middle" alignmentBaseline="hanging">{ bar.lastRun }</text>
											</g>
										))
										}
									</svg>
									
								</div>
								
								<div className="actionContainer">
									<div className="setActionButton" onClick={ () => this.completeSet(setIndex) }>
									{
									workoutSet.isComplete ?
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
											<path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
										</svg>
									:
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
											<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
										</svg>
									}
									</div>
									
									{
									workoutSet.isComplete || workoutSet.isRest ?
									<div className="setComplete">
										{
										workoutSet.isRest && this.state.countDown.sec > 0 ?
											<div>
												<div>{ (this.state.countDown.min < 10 ? "0" : "") + this.state.countDown.min }</div>
												<div>{ (this.state.countDown.sec < 10 ? "0" : "") + this.state.countDown.sec }</div>
											</div>
										:
										workoutSet.isComplete && !workoutSet.isRest ?
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
												<path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
											</svg>
										: ""
										}
									</div>
									: ""
									}
									
									<div className="setActionButton" onClick={ () => this.deleteSet(setIndex) }>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
											<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
										</svg>
									</div>
								</div>
								
							</div>
							
							<div className="addButton">
								<div onClick={ () => this.addSet(setIndex) }>+</div>
							</div>
						</div>
					))
					}
					</div>
				</div>
			}
			</div>
		);
	}
}

export default WorkoutActivity;
