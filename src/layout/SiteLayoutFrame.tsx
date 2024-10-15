import { ModalUIMessageWindow } from "../components/modal-ui/ModalUIMessageWindow";
import { SiteFooter } from "./SiteFooter";
import { SiteNavbar } from "./SiteNavbar";

/**
 * Props for SiteLayoutFrame.
 */
interface SiteLayoutFrameProps {
	children: string | JSX.Element | JSX.Element[] | (() => JSX.Element);
}

/**
 * Renders the static layout elements around the contents of the page.
 * @param props
 * @returns
 */
export function SiteLayoutFrame(props: SiteLayoutFrameProps) {
	return (
		<>
			<SiteNavbar />
			{props.children}
			<ModalUIMessageWindow />
			<SiteFooter />
		</>
	);
}
