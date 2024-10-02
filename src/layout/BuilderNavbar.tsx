import NavDropdown from "react-bootstrap/NavDropdown";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import {
	builderTabSelector,
	createSession,
	useAppSelector,
} from "../state/AppStore";

export function BuilderNavbar() {
	const sessions = useAppSelector(builderTabSelector());

	function createRyuutamaPC() {
		createSession("ryuutama", true, undefined);
	}

	return (
		<Navbar expand="lg" bg="secondary">
			<Navbar.Collapse>
				<Nav>
					<NavDropdown title="Create Character" id="builder-create">
						<NavDropdown.Item href="#" onClick={createRyuutamaPC}>
							Ryuutama PC
						</NavDropdown.Item>
					</NavDropdown>
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	);
}
