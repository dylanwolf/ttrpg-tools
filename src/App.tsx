import { observer } from "mobx-react-lite";
import "./App.css";
import { BuilderProcess } from "./components/BuilderProcess";
import { CharacterViewModel } from "./models/CharacterViewModel";
import { DumpObject } from "./components/DumpObject";

const model = new CharacterViewModel();

const App = observer(() => {
	return (
		<>
			<div>
				<BuilderProcess characterModel={model} />
			</div>
			<div>
				<h2>Debug</h2>
				<DumpObject object={model} />
			</div>
		</>
	);
});

export default App;
