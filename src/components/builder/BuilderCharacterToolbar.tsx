import { saveAsBuilderJson } from "../../data/JsonFileUtils";
import { builderStateSelector, useAppSelector } from "../../state/AppStore";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons/faDownload";
import { faDiceD20 } from "@fortawesome/free-solid-svg-icons/faDiceD20";

export interface BuilderCharacterToolbarProps {
	sessionKey: string;
	showCharacterSheetMobile: boolean;
	setShowCharacterSheetMobile: (value: boolean) => void;
}

export function BuilderCharacterToolbar(props: BuilderCharacterToolbarProps) {
	const model = useAppSelector(builderStateSelector(props.sessionKey));

	function saveAsJson() {
		if (model) {
			saveAsBuilderJson(model?.Model.BuilderKey, model?.Character);
		}
	}

	function toggleMobileView() {
		props.setShowCharacterSheetMobile(!props.showCharacterSheetMobile);
	}

	return (
		<Navbar expand="md" bg="secondary" variant="pills">
			<Navbar.Toggle aria-controls="character-toolbar"></Navbar.Toggle>
			<Navbar.Collapse id="character-toolbar">
				<Nav>
					<Button variant="primary" onClick={saveAsJson}>
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
