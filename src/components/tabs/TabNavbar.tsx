import { setBrowserTitle } from "../../layout/BrowserUtils";
import { useAppSelector } from "../../state/AppStateStorage";
import {
	closeTabSession,
	setCurrentTabSession,
	tabSessionSelector,
} from "../../state/tab-sessions/TabSessions";
import Nav from "react-bootstrap/Nav";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./TabNavbar.css";
import { useEffect } from "react";
import {
	hasTabMemory,
	loadTabMemory,
} from "../../state/tab-sessions/TabMemory";

/**
 * Pulls a list of sessions from Redux state and displays a scrolling tab bar.
 * @returns JSX.Element
 */
export function TabNavbar() {
	const sessions = useAppSelector(tabSessionSelector());

	useEffect(() => {
		if (Object.keys(sessions.Sessions).length === 0 && hasTabMemory()) {
			loadTabMemory();
		}
	});

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
			className="mt-4"
			id="tab-navbar"
		>
			{Object.values(sessions.Sessions).map((session) => {
				return (
					<Nav.Link
						className="d-flex"
						key={`BuilderTab-${session.SessionKey}`}
						eventKey={session.SessionKey}
						onClick={() => onSelected(session.SessionKey)}
					>
						<div>{session.Title}</div>
						<div
							className="close-button"
							onClick={(e) => onRemoved(session.SessionKey, e)}
						>
							<FontAwesomeIcon icon={faXmark} />
						</div>
					</Nav.Link>
				);
			})}
		</Nav>
	);
}
