import "./nav.css";

const Nav = (props) => {
	const iconStyle = {
		fill: "rgb(245 81 28)"
	};
	
	return (
	<div className="navContainer">
		<div className="item" onClick={ props.changePage.bind(this, "home") }>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<path style={iconStyle} d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
			</svg>
		</div>
		
		<div className="item" onClick={ props.changePage.bind(this, "workout") }>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<path style={iconStyle} d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
			</svg>
		</div>
		
		<div className="item" onClick={ props.changePage.bind(this, "schedule") }>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<path style={iconStyle} d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
			</svg>
		</div>
		
		<div className="item" onClick={ props.changePage.bind(this, "admin") }>
			<svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" viewBox="0 0 24 24">
				<g>
					<rect fill="none" height="24" width="24"/>
				</g>
				<g>
					<g>
						<path style={iconStyle} d="M17,11c0.34,0,0.67,0.04,1,0.09V6.27L10.5,3L3,6.27v4.91c0,4.54,3.2,8.79,7.5,9.82c0.55-0.13,1.08-0.32,1.6-0.55 C11.41,19.47,11,18.28,11,17C11,13.69,13.69,11,17,11z"/>
						<path style={iconStyle} d="M17,13c-2.21,0-4,1.79-4,4c0,2.21,1.79,4,4,4s4-1.79,4-4C21,14.79,19.21,13,17,13z M17,14.38c0.62,0,1.12,0.51,1.12,1.12 s-0.51,1.12-1.12,1.12s-1.12-0.51-1.12-1.12S16.38,14.38,17,14.38z M17,19.75c-0.93,0-1.74-0.46-2.24-1.17 c0.05-0.72,1.51-1.08,2.24-1.08s2.19,0.36,2.24,1.08C18.74,19.29,17.93,19.75,17,19.75z"/>
					</g>
				</g>
			</svg>
		</div>
	</div>
	);
};

export default Nav;
