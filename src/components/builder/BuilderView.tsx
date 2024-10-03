import { BuilderProcess } from "./BuilderProcess";
import { BuilderTabs } from "./BuilderTabs";
import {
	builderStateSelector,
	builderTabSelector,
	useAppSelector,
} from "../../state/AppStore";

import "./BuilderView.css";
import { DumpObject } from "../DumpObject";

//(window as any).__DEBUG__ = true;

export function BuilderView() {
	const sessions = useAppSelector(builderTabSelector());

	return (
		<div className="character-builder">
			<BuilderTabs />
			{sessions.CurrentSessionKey ? (
				<BuilderProcess sessionKey={sessions.CurrentSessionKey} />
			) : (
				<></>
			)}
			{(window as any).__DEBUG__ && sessions.CurrentSessionKey ? (
				<StateDump sessionKey={sessions.CurrentSessionKey} />
			) : (
				<></>
			)}
		</div>
	);
}

interface StateDumpProps {
	sessionKey: string;
}

function StateDump(props: StateDumpProps) {
	const model = useAppSelector(builderStateSelector(props.sessionKey));

	return (
		<div className="debug-info">
			<h2>Character Data</h2>
			<DumpObject object={model?.Character} />

			<h2>Step State</h2>
			<DumpObject object={model?.StepState} />

			<h2>Source Data</h2>
			<DumpObject object={model?.SourceData} />
		</div>
	);
}
