import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { BrowserRouter, Link } from "react-router-dom";

export function SiteNavbar() {
	return (
		<BrowserRouter>
			<Navbar expand="lg" bg="primary" data-bs-theme="dark">
				<Navbar.Brand as={Link} to="/">
					ttrpgbuilder.dylanwolf.com
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="toplevel-navbar"></Navbar.Toggle>
				<Navbar.Collapse id="toplevel-navbar">
					<Nav activeKey={window.location.pathname}>
						<Nav.Item>
							<Nav.Link as={Link} to="/builder">
								Character Builder
							</Nav.Link>
						</Nav.Item>
					</Nav>
				</Navbar.Collapse>
			</Navbar>
		</BrowserRouter>
	);
}
