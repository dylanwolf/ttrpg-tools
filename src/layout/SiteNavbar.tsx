import { useRef, useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { JsonFileLoader } from "../data/JsonFileUtils";
import { BusyIcon } from "../components/BusyIcon";
import {
	createCharacterBuilderSession,
	openCharacterBuilderJsonFile,
} from "../state/character-builder/BuilderTabSessions";
import { openMessageWindow } from "../state/modal-ui/ModalUI";
import { createEncounterBuilder5eSession } from "../state/encounter-builder-5e/EncounterBuilder5eTabSessions";

export function SiteNavbar() {
	const openCharacterJsonRef = useRef(null);
	const [isBusy, setIsBusy] = useState(false);
	const navigate = useNavigate();

	function switchToTabView() {
		navigate("/");
	}

	function onClickOpenCharacterBuilderJsonFile() {
		navigate("/");
		(openCharacterJsonRef.current as any).click();
	}

	function onClickCreateCharacterBuilderSession(builderKey: string) {
		navigate("/");
		setIsBusy(true);
		createCharacterBuilderSession(builderKey)
			.catch((ex) => openMessageWindow(ex))
			.finally(() => setIsBusy(false));
	}

	function onCharacterBuilderJsonFileOpened(fileData: any) {
		setIsBusy(true);
		openCharacterBuilderJsonFile(fileData)
			.catch((ex) => openMessageWindow(ex))
			.finally(() => setIsBusy(false));
	}

	function onClickCreateEncounterBuilder5eSession() {
		createEncounterBuilder5eSession();
	}

	return (
		<>
			<Navbar expand="lg" bg="primary" data-bs-theme="dark">
				<Navbar.Brand as={Link} to="/">
					ttrpgbuilder.dylanwolf.com
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="toplevel-navbar"></Navbar.Toggle>
				<Navbar.Collapse id="toplevel-navbar">
					<Nav activeKey={window.location.pathname}>
						{isBusy ? <BusyIcon /> : <></>}
						{!isBusy ? (
							<>
								<NavDropdown
									title="Character Builder"
									onClick={switchToTabView}
								>
									<NavDropdown.Item
										onClick={onClickOpenCharacterBuilderJsonFile}
									>
										Load JSON File
									</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item
										onClick={() =>
											onClickCreateCharacterBuilderSession("ryuutama")
										}
									>
										New Ryuutama PC
									</NavDropdown.Item>
								</NavDropdown>
								{/* <NavDropdown title="GM Utilities" onClick={switchToTabView}>
							<NavDropdown.Item
								onClick={onClickCreateEncounterBuilder5eSession}
							>
								New 5e Encounter Builder
							</NavDropdown.Item>
						</NavDropdown> */}
							</>
						) : (
							<></>
						)}
						<Nav.Item>
							<Nav.Link as={NavLink} to="/about">
								About
							</Nav.Link>
						</Nav.Item>
					</Nav>
				</Navbar.Collapse>
			</Navbar>
			<JsonFileLoader
				forwardedRef={openCharacterJsonRef}
				onFileLoaded={onCharacterBuilderJsonFileOpened}
			/>
		</>
	);
}
