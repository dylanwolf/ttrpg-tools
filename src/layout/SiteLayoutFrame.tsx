import { SiteNavbar } from "./SiteNavbar";

interface SiteLayoutFrameProps {
	children: string | JSX.Element | JSX.Element[] | (() => JSX.Element);
}

export function SiteLayoutFrame(props: SiteLayoutFrameProps) {
	return (
		<>
			<SiteNavbar />
			{props.children}
		</>
	);
}
