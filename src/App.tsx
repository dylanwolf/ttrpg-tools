import { Provider } from "react-redux";
import "./App.css";
import React from "react";
import { BuilderView } from "./components/BuilderView";
import { SiteLayoutFrame } from "./layout/SiteLayoutFrame";
import "bootstrap/dist/css/bootstrap.min.css";
import { BuilderNavbar } from "./layout/BuilderNavbar";
import { store } from "./state/AppStore";

/* Load models */
require("./data/ryuutama/BuilderModel");
require("./data/ryuutama/CharacterSheet");

function App() {
	return (
		<>
			<React.StrictMode>
				<Provider store={store} stabilityCheck="never">
					<SiteLayoutFrame>
						<BuilderNavbar />
						<BuilderView />
					</SiteLayoutFrame>
				</Provider>
			</React.StrictMode>
		</>
	);
}

export default App;
