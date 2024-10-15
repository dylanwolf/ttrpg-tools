import { BusyIcon } from "../components/BusyIcon";

/**
 * Renders the busy icon when a page or tab is loading.
 * @returns
 */
export function LoadingPage() {
	return (
		<div className="my-5 text-center">
			<BusyIcon />
		</div>
	);
}
