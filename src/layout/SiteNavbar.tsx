import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, NavLink } from "react-router-dom";

export function SiteNavbar() {
	return (
		<Navbar expand="lg" bg="primary" data-bs-theme="dark">
			<Navbar.Brand as={Link} to="/">
				ttrpgbuilder.dylanwolf.com
			</Navbar.Brand>
			<Navbar.Toggle aria-controls="toplevel-navbar"></Navbar.Toggle>
			<Navbar.Collapse id="toplevel-navbar">
				<Nav activeKey={window.location.pathname}>
					<Nav.Item>
						<Nav.Link as={NavLink} to="/builder">
							Character Builder
						</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link as={NavLink} to="/about">
							About
						</Nav.Link>
					</Nav.Item>
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	);
}
