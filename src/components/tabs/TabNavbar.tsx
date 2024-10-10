import { setBrowserTitle } from "../../layout/BrowserUtils";
import { useAppSelector } from "../../state/AppStore";
import {
	closeTabSession,
	setCurrentTabSession,
	tabSessionSelector,
} from "../../state/tab-sessions/TabSessions";
import Nav from "react-bootstrap/Nav";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./TabNavbar.css";

export function TabNavbar() {
	const sessions = useAppSelector(tabSessionSelector());

	function onSelected(sessionKey: string) {
		if (
			sessionKey !== sessions.CurrentSessionKey &&
			sessions.Sessions[sessionKey]
		) {
			setCurrentTabSession(sessionKey);
			setBrowserTitle(sessions.Sessions[sessionKey].Title);
		}
	}

	function onRemoved(
		sessionKey: string,
		evt: React.MouseEvent<HTMLSpanElement, MouseEvent>
	) {
		// TODO: Confirm removal
		closeTabSession(sessionKey);
		evt.preventDefault();
		return false;
	}

	if (Object.values(sessions.Sessions).length === 0) return <></>;

	return (
		<Nav
			variant="tabs"
			activeKey={sessions.CurrentSessionKey}
			className="margin-left"
			id="tab-navbar"
		>
			{Object.values(sessions.Sessions).map((session) => {
				return (
					<Nav.Link
						key={`BuilderTab-${session.SessionKey}`}
						eventKey={session.SessionKey}
						onClick={() => onSelected(session.SessionKey)}
					>
						{session.Title}
						<span
							className="close-button"
							onClick={(e) => onRemoved(session.SessionKey, e)}
						>
							<FontAwesomeIcon icon={faXmark} />
						</span>
					</Nav.Link>
				);
			})}
		</Nav>
	);
}
