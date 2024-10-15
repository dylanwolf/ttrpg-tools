import { waveform } from "ldrs";

waveform.register();

/**
 * Displays an animated loading icon.
 * @returns JSX.Element
 */
export function BusyIcon() {
	return (
		<div className="busy">
			<l-waveform size="32" stroke="2" speed="1" color="white" />
		</div>
	);
}
