import React from "react";
import "./schedule.css";
import loadingImage from "../media/loading.gif";

class Schedule extends React.Component {
	monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	weekNames = [{name: "Sunday", short: "S"}, {name: "Monday", short: "M"}, {name: "Tuesday", short: "T"}, {name: "Wednesday", short: "W"}, {name: "Thursday", short: "T"}, {name: "Friday", short: "F"}, {name: "Saturday", short: "S"}];
	
	constructor(props) {
		super(props);
		
		this.state = {
			isLoading: false, //true
			currentMonth: new Date(),
			selectedWeek: 0,
			calendar: []
		};
		
	}
	
	componentDidMount() {
		this.loadMonth(true);
	}
	
	loadMonth = isDefaultWeek => {
		const today = new Date();
		
		const monthFirst = new Date(this.state.currentMonth.getFullYear(), this.state.currentMonth.getMonth(), 1);
		let calendarFirst = monthFirst;
		calendarFirst = new Date(calendarFirst.setDate(calendarFirst.getDate() - calendarFirst.getDay() - 1));
		
		let monthLast = new Date(this.state.currentMonth.getFullYear(), this.state.currentMonth.getMonth() + 1, 1);
		monthLast = new Date(monthLast.setDate(monthLast.getDate() - 1));
		let calendarLast = monthLast;
		calendarLast = new Date(calendarLast.setDate(calendarLast.getDate() + (6 - calendarLast.getDay())));
		
		const weeks = Math.ceil((calendarLast - calendarFirst) / 1000 / 60 / 60 / 24 / 7);
		
		let calendar = Array.from({length: weeks}, (item, index) => 
			Array.from({length: 7}, (item, index) => new Date(calendarFirst.setDate(calendarFirst.getDate() + 1)) )
			);
		
		calendar = calendar.map(week => ({
			days: week.map(date => ({ day: date, isToday: date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate() }) ),
			isSelected: this.state.selectedWeek
		}));
		
		this.setState({ 
			calendar: calendar 
		},
		() => this.setState({ selectedWeek: this.state.calendar.findIndex(week => week.days.some(day => day.isToday)) })
		);
	}
	
	changeMonth = change => event => {
		let updateDate = this.state.currentMonth;
		updateDate = new Date(updateDate.setMonth(updateDate.getMonth() + change));
		
		this.setState({currentMonth: updateDate});
		this.loadMonth();
	}
	
	selectWeek = weekIndex => event => {
		this.setState({selectedWeek: weekIndex});
	}
	
	render() {
		return (
			<div className="page schedulePage">
				<h1>Schedule</h1>
				
				{
				this.state.isLoading ?
				<div className="loading">
					<img alt="Loading" src={loadingImage} />
					<div>Loading...</div>
				</div>
				:
				<div>
					<div className="row monthHeader">
						<div className="button" onClick={this.changeMonth(-1)}>&lt;</div>
						<div>{ this.monthNames[this.state.currentMonth.getMonth()] + " " + this.state.currentMonth.getFullYear() }</div>
						<div className="button" onClick={this.changeMonth(1)}>&gt;</div>
					</div>
					
					<div className="calendar">
						<div className="row week">
						{
							this.weekNames.map((day, dayIndex) => (
							<div key={dayIndex} className="date">{day.short}</div>
							))
						}
						</div>
						
						{
						this.state.calendar.map((week, weekIndex) => (
						<div key={weekIndex} className={`row week ${ weekIndex === this.state.selectedWeek ? "weekHighlight" : "" }`} onClick={this.selectWeek(weekIndex)}>
						{
							week.days.map((date, dateIndex) => (
							<div key={dateIndex} className={`date ${date.isToday ? "today" : ""} ${weekIndex === this.state.selectedWeek && (dateIndex === 0 || dateIndex === 6) ? "weekKey" : "" }`}>
								{date.day.getDate()}
							</div>
							))
						}
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
export default Schedule;
