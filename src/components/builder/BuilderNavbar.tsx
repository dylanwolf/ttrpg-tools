import NavDropdown from "react-bootstrap/NavDropdown";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { createSession } from "../../state/AppStore";
import { useRef } from "react";
import { JsonFileLoader } from "../../data/JsonFileUtils";

export function BuilderNavbar() {
	const openCharacterJsonRef = useRef(null);

	function openFile() {
		(openCharacterJsonRef.current as any).click();
	}

	function onFileOpened(fileData: any) {
		if (fileData && fileData.BuilderKey && fileData.CharacterData) {
			createSession(fileData.BuilderKey, true, fileData.CharacterData);
		}
	}

	function createRyuutamaPC() {
		createSession("ryuutama", true, undefined);
	}

	return (
		<>
			<Navbar expand="lg" bg="secondary" data-bs-theme="dark">
				<Navbar.Toggle aria-controls="builder-navbar"></Navbar.Toggle>
				<Navbar.Collapse id="builder-navbar">
					<Nav>
						<NavDropdown title="Create Character" id="builder-create">
							<NavDropdown.Item href="#" onClick={createRyuutamaPC}>
								Ryuutama PC
							</NavDropdown.Item>
						</NavDropdown>
						<Nav.Item>
							<Nav.Link onClick={openFile}>Load JSON File</Nav.Link>
						</Nav.Item>
					</Nav>
				</Navbar.Collapse>
			</Navbar>
			<JsonFileLoader
				forwardedRef={openCharacterJsonRef}
				onFileLoaded={onFileOpened}
			/>
		</>
	);
}
