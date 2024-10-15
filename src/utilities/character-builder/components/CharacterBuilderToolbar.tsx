import { useAppSelector } from "../../../state/AppStateStorage";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons/faDownload";
import { faDiceD20 } from "@fortawesome/free-solid-svg-icons/faDiceD20";
import {
	characterBuilderSessionSelector,
	downloadCharacterBuilderJson,
} from "../BuilderTabSessions";

/**
 * Props to be passed into the character builder toolbar
 */
export interface CharacterBuilderToolbarProps {
	sessionKey: string;
	showCharacterSheetMobile: boolean;
	setShowCharacterSheetMobile: (value: boolean) => void;
}

/**
 * Renders a toolbar above the character builder. The toolbar is sticky when scrolled. It allows the character data to be downloaded as JSON, and (in narrow mobile views) swaps between the character builder and the character sheet.
 * @param props
 * @returns
 */
export function CharacterBuilderToolbar(props: CharacterBuilderToolbarProps) {
	const state = useAppSelector(
		characterBuilderSessionSelector(props.sessionKey)
	);

	function toggleMobileView() {
		props.setShowCharacterSheetMobile(!props.showCharacterSheetMobile);
	}

	return (
		<Navbar expand="md" bg="secondary" variant="pills" className="sticky-top">
			<Navbar.Toggle aria-controls="character-toolbar"></Navbar.Toggle>
			<Navbar.Collapse id="character-toolbar">
				<Nav>
					<Button
						variant="primary"
						onClick={() => downloadCharacterBuilderJson(state)}
					>
						<FontAwesomeIcon icon={faDownload} />
						Download as JSON
					</Button>
					<Button
						variant="primary"
						onClick={toggleMobileView}
						className="d-lg-none"
					>
						<FontAwesomeIcon icon={faDiceD20} />
						Show{" "}
						{props.showCharacterSheetMobile ? "Builder" : "Character Sheet"}
					</Button>
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	);
}
