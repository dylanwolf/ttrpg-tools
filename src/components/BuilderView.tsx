import { BuilderProcess } from "./BuilderProcess";
import { BuilderTabs } from "./BuilderTabs";
import { builderTabSelector, useAppSelector } from "../state/AppStore";

export function BuilderView() {
	const sessions = useAppSelector(builderTabSelector());

	return (
		<>
			<BuilderTabs />
			{sessions.CurrentSessionKey ? (
				<BuilderProcess sessionKey={sessions.CurrentSessionKey} />
			) : (
				<></>
			)}
		</>
	);
}
