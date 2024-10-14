import { useRef, useState } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { JsonFileLoader } from "../helpers/JsonFileUtils";
import { BusyIcon } from "../components/BusyIcon";
import { openMessageWindow } from "../state/modal-ui/ModalUI";
import { DOMAIN_NAME } from "./BrowserUtils";
import { createTabSessionForUtility, UtilityKey } from "../utilities";
import { useAppSelector } from "../state/AppStateStorage";
import { tabSessionSelector } from "../state/tab-sessions/TabSessions";

export function SiteNavbar() {
	const openJsonFileRef = useRef(null);
	const [isBusy, setIsBusy] = useState(false);
	const navigate = useNavigate();
	const tabs = useAppSelector(tabSessionSelector());

	const combinedIsBusy =
		isBusy || Object.values(tabs?.Sessions).any((x) => x.IsBusy);

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
		createTabSessionForUtility(UtilityKey.CHARACTER_BUILDER, {
			BuilderKey: builderKey,
		})
			.catch((ex) => openMessageWindow(ex))
			.finally(() => setIsBusy(false));
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
						{combinedIsBusy ? <BusyIcon /> : <></>}
						{!combinedIsBusy ? (
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
									<NavDropdown.Item
										onClick={() =>
											onClickCreateCharacterBuilderSession("ryuutama-ryuujin")
										}
									>
										Create Ryuutama Ryuujin
									</NavDropdown.Item>
								</NavDropdown>
								<NavDropdown title="GM Utilities" onClick={switchToTabView}>
									<NavDropdown.Item onClick={onClickOpenJsonFile}>
										Load JSON File
									</NavDropdown.Item>
									<NavDropdown.Divider />
									<NavDropdown.Item
										onClick={() =>
											createTabSessionForUtility(
												UtilityKey.ENCOUNTER_BUILDER_5E
											)
										}
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
