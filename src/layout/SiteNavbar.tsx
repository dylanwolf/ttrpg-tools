import { useRef, useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { JsonFileLoader } from "../helpers/JsonFileUtils";
import { BusyIcon } from "../components/BusyIcon";
import { createCharacterBuilderSession } from "../state/character-builder/BuilderTabSessions";
import { openMessageWindow } from "../state/modal-ui/ModalUI";
import { createEncounterBuilder5eSession } from "../state/encounter-builder-5e/EncounterBuilder5eTabSessions";
import { DOMAIN_NAME } from "./BrowserUtils";

export function SiteNavbar() {
	const openJsonFileRef = useRef(null);
	const [isBusy, setIsBusy] = useState(false);
	const navigate = useNavigate();

	function switchToTabView() {
		navigate("/");
	}

	function onClickOpenJsonFile() {
		navigate("/");
		(openJsonFileRef.current as any).LoadFile();
	}

	function onClickCreateCharacterBuilderSession(builderKey: string) {
		navigate("/");
		setIsBusy(true);
		createCharacterBuilderSession(builderKey)
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
					{DOMAIN_NAME}
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
									<NavDropdown.Item onClick={onClickOpenJsonFile}>
										Load JSON File
									</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item
										onClick={() =>
											onClickCreateCharacterBuilderSession("ryuutama")
										}
									>
										Create Ryuutama PC
									</NavDropdown.Item>
								</NavDropdown>
								<NavDropdown title="GM Utilities" onClick={switchToTabView}>
									<NavDropdown.Item onClick={onClickOpenJsonFile}>
										Load JSON File
									</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item
										onClick={onClickCreateEncounterBuilder5eSession}
									>
										Create 5e Encounter
									</NavDropdown.Item>
								</NavDropdown>
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
				ref={openJsonFileRef}
				onLoadStarted={() => setIsBusy(true)}
				onLoadCompleted={() => setIsBusy(false)}
				onError={(ex) => {
					setIsBusy(false);
					openMessageWindow(ex);
				}}
			/>
		</>
	);
}
