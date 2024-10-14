import { CharacterBuilderProcess } from "./CharacterBuilderProcess";
import { useAppSelector } from "../../../state/AppStateStorage";
import "./CharacterBuilderView.css";
import { DumpObject } from "../../../components/DumpObject";
import { characterBuilderSessionSelector } from "../BuilderTabSessions";

export default function CharacterBuilderView() {
	const session = useAppSelector(characterBuilderSessionSelector());
	var sessionKey = session?.StepState.SessionKey;
	if (!sessionKey) return <></>;

	return (
		<div className="character-builder">
			<CharacterBuilderProcess sessionKey={sessionKey} />
			{(window as any).__DEBUG__ ? <StateDump /> : <></>}
		</div>
	);
}

function StateDump() {
	const session = useAppSelector(characterBuilderSessionSelector());

	return (
		<div className="debug-info">
			<h2>Character Data</h2>
			<DumpObject object={session?.Character} />

			<h2>Step State</h2>
			<DumpObject object={session?.StepState} />

			<h2>Source Data</h2>
			<DumpObject object={session?.SourceData} />
		</div>
	);
}
