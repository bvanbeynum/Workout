import { useState } from "react";
import "./login.css";

const Login = (props) => {
	const[update, setUpdate] = useState("");
	
	const requestAccess = () => {
		fetch(`http://${process.env.REACT_APP_API_HOST}/api/requestaccess`, { credentials: "include" })
			.then(response => response.json())
			.then(data => {
				setUpdate("Access Requested");
			})
			.catch(error => {
				console.warn(error);
				props.toast("Error processing request", true);
			});
	};
	
	return (
	<div className="loginPage">
		<div className="icon">
			<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24" fill="black">
				<g>
					<rect fill="none" height="24" width="24"/>
					<path d="M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1L12,1z M11,7h2v2h-2V7z M11,11h2v6h-2V11z"/>
				</g>
			</svg>
		</div>
		
		<div className="content">
			This is a restricted site that requires pre-approval to use. If you'd like access to this site, 
			you can request access using the button below. The request will be reviewed and approved if qualified.
		</div>
		
		{ update.length === 0 ? <button onClick={requestAccess}>Request Access</button> : null }
		
		<div className="update">
			{update}
		</div>
	</div>
	);
};

export default Login;
