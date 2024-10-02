import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

export function SiteNavbar() {
	return (
		<Navbar expand="lg" bg="primary">
			<Container>
				<Navbar.Brand href="#">ttrpgbuilder.dylanwolf.com</Navbar.Brand>
				<Navbar.Toggle aria-controls="toplevel-navbar"></Navbar.Toggle>
				<Navbar.Collapse id="toplevel-navbar">
					<Nav></Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}
