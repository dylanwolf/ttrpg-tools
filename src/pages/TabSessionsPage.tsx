import { TabNavbar } from "../components/tabs/TabNavbar";
import { TabContentRouter } from "../components/tabs/TabRouter";

/**
 * Renders the tab view used for tools, including the scrolling navbar and the contents of the currently selected tab.
 * @returns
 */
export default function TabSessionsPage() {
	return (
		<>
			<TabNavbar />
			<TabContentRouter />
		</>
	);
}
