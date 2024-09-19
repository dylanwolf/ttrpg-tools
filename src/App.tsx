import { Provider } from "react-redux";
import "./App.css";
import { BuilderProcess } from "./components/BuilderProcess";
import { store } from "./models/AppStore";
import React from "react";

/* Load models */
require("./data/ryuutama/BuilderModel");
require("./data/ryuutama/CharacterSheet");

function App() {
	return (
		<>
			<div>
				<React.StrictMode>
					<Provider store={store} stabilityCheck="never">
						<BuilderProcess sessionKey={"test"} />
					</Provider>
				</React.StrictMode>
			</div>
		</>
	);
}

export default App;
