import React, { Component}  from "react";
import { Link } from "react-router-dom";
import WebcamCapture from "./Camera_Kevin.js";

import "../App/App.css";
import Header from "../Header/Header";

class Kevin extends Component {
	render() {
		return (
			<div className="Kevin">
				<Header />
				<h1>Kevin's app</h1>
				<div className="App-body">
                    <div className="image_page">
                        <h2> Iteration 2</h2>
                        <h3> Take Photo of Skin Lesion</h3>
						
						<p style={{ textAlign: "center", marginBottom: "20px" }}> Webcam Capture </p>
                                <WebcamCapture context="kevin" />
                    </div>
					
				</div>
			</div>
		);
	}
}
export default Kevin;
