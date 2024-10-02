import Nav from "react-bootstrap/Nav";
import {
	builderTabSelector,
	useAppDispatch,
	useAppSelector,
} from "../state/AppStore";
import { removeSession, setCurrentSession } from "../state/BuilderSessionSlice";

export function BuilderTabs() {
	const sessions = useAppSelector(builderTabSelector());
	const dispatch = useAppDispatch();

	function onSelected(sessionKey: string) {
		if (sessionKey !== sessions.CurrentSessionKey)
			dispatch(setCurrentSession(sessionKey));
	}

	function onRemoved(
		sessionKey: string,
		evt: React.MouseEvent<HTMLSpanElement, MouseEvent>
	) {
		// TODO: Confirm removal
		dispatch(removeSession(sessionKey));
		evt.preventDefault();
		return false;
	}

	return (
		<Nav variant="tabs" activeKey={sessions.CurrentSessionKey}>
			{sessions.Tabs.map((session) => {
				return (
					<Nav.Link
						key={`BuilderTab-${session.SessionKey}`}
						eventKey={session.SessionKey}
						onClick={function () {
							onSelected(session.SessionKey);
						}}
					>
						<span>
							{session.CharacterTitle} ({session.BuilderName})
						</span>
						<span
							onClick={function (e) {
								onRemoved(session.SessionKey, e);
							}}
						>
							&times;
						</span>
					</Nav.Link>
				);
			})}
		</Nav>
	);
}
