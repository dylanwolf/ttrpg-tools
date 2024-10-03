import Nav from "react-bootstrap/Nav";
import {
	builderTabSelector,
	useAppDispatch,
	useAppSelector,
} from "../../state/AppStore";
import {
	removeSession,
	setCurrentSession,
} from "../../state/BuilderSessionSlice";
import "./BuilderTabs.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
		<Nav
			variant="tabs"
			activeKey={sessions.CurrentSessionKey}
			className="margin-left"
		>
			{sessions.Tabs.map((session) => {
				return (
					<Nav.Link
						key={`BuilderTab-${session.SessionKey}`}
						eventKey={session.SessionKey}
						onClick={function () {
							onSelected(session.SessionKey);
						}}
					>
						{session.CharacterTitle} ({session.BuilderName})
						<span
							className="close-button"
							onClick={function (e) {
								onRemoved(session.SessionKey, e);
							}}
						>
							<FontAwesomeIcon icon={faXmark} />
						</span>
					</Nav.Link>
				);
			})}
		</Nav>
	);
}
