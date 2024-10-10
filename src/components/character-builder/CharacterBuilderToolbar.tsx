import {
	JSON_UTILITY_KEYS,
	downloadAsLoadableJson,
} from "../../helpers/JsonFileUtils";
import { useAppSelector } from "../../state/AppStore";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons/faDownload";
import { faDiceD20 } from "@fortawesome/free-solid-svg-icons/faDiceD20";
import { characterBuilderSessionSelector } from "../../state/character-builder/BuilderTabSessions";
import { downloadCharacterBuilderJson } from "../../data/CharacterBuilder";

export interface CharacterBuilderToolbarProps {
	sessionKey: string;
	showCharacterSheetMobile: boolean;
	setShowCharacterSheetMobile: (value: boolean) => void;
}

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
