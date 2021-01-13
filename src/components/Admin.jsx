import React from "react";
import "./admin.css";

class Admin extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			isUserExpanded: false,
			isRoleExpanded: false,
			users: [],
			roles: []
		};
	}
	
	componentDidMount() {
		this.setState({
			users: [
				{ id: 1, name: "Brett van Beynum", roles: [{ id: 1, name: "Admin" }], devices: [{ id: 1, type: "Phone"}, { id: 2, type: "Chromebook"}] }, 
				{ id: 2, name: "Luke van Beynum", roles: [] }
			]
		});
		
		this.setState({
			roles: [{ id: 1, name: "Admin" }]
		});
	}
	
	getUserStyle = (expandable) => {
		return {
			display: expandable ? "flex": "none"
		};
	}
	
	render() {
		return (
			<div className="page adminPage">
				<div className="headerBackground">
				</div>
				
				<div className="container" onClick={ (event) => { this.setState({ isUserExpanded: !this.state.isUserExpanded, isRoleExpanded: false }) } }>
					<div className="subHeader">{ this.state.users.length } users total</div>
					<div className="header">Users</div>
					
					<div className="listContainer" style={this.getUserStyle(this.state.isUserExpanded)}>
						{
						this.state.users.map((user) => (
							<div className="listItem">
								<div className="itemContainer">
									<div className="itemIcon">{user.name.substring(0,1)}</div>
									<div className="itemHeader">{ user.name }</div>
								</div>
							</div>
						))
						}
					</div>
				</div>
				
				<div className="container" onClick={ (event) => { this.setState({ isUserExpanded: false, isRoleExpanded: !this.state.isRoleExpanded }) } }>
					<div className="subHeader">{ this.state.roles.length } roles total</div>
					<div className="header">Roles</div>
					
					<div className="listContainer" style={this.getUserStyle(this.state.isRoleExpanded)}>
					
					</div>
				</div>
			</div>
		);
	}
}

export default Admin;
