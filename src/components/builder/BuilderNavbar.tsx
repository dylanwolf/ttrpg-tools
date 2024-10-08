import NavDropdown from "react-bootstrap/NavDropdown";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { createSession, openMessageWindow } from "../../state/AppStore";
import { useRef, useState } from "react";
import { JsonFileLoader } from "../../data/JsonFileUtils";
import { BusyIcon } from "../BusyIcon";

export function BuilderNavbar() {
	const openCharacterJsonRef = useRef(null);
	const [isBusy, setIsBusy] = useState(false);

	function openFile() {
		(openCharacterJsonRef.current as any).click();
	}

	function onFileOpened(fileData: any) {
		if (fileData) {
			if (fileData.BuilderKey && fileData.CharacterData) {
				createSessionFor(fileData.BuilderKey, fileData.CharacterData);
			} else {
				openMessageWindow({
					Title: "Error opening character builder",
					Message: `This doesn't appear to be a valid character builder file.`,
				});
			}
		}
	}

	function createSessionFor(builderKey: string, initialData?: any) {
		if (builderKey.match(/[^a-z0-9\-]/)) {
			openMessageWindow({
				Title: "Error opening character builder",
				Message: `Invalid builder key: ${builderKey}. This character builder may not be supported.`,
			});
			console.error(`Invalid builder key ${builderKey}`);
			return;
		}

		setIsBusy(true);
		import(`../../data/${builderKey}/index.ts`)
			.then(() => createSession(builderKey, true, initialData))
			.catch((ex) =>
				openMessageWindow({
					Title: "Error loading character builder data",
					Message: `${ex}`,
				})
			)
			.finally(() => setIsBusy(false));
	}

	return (
		<>
			<Navbar expand="lg" bg="secondary" data-bs-theme="dark">
				<Navbar.Toggle aria-controls="builder-navbar"></Navbar.Toggle>
				<Navbar.Collapse id="builder-navbar">
					<Nav>
						{isBusy ? (
							<BusyIcon />
						) : (
							<>
								<NavDropdown title="Create Character" id="builder-create">
									<NavDropdown.Item
										href="#"
										onClick={() => createSessionFor("ryuutama")}
									>
										Ryuutama PC
									</NavDropdown.Item>
								</NavDropdown>
								<Nav.Item>
									<Nav.Link onClick={openFile}>Load JSON File</Nav.Link>
								</Nav.Item>
							</>
						)}
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
