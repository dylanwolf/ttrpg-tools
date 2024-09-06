import { waveform } from "ldrs";

waveform.register();

export function BusyIcon() {
	return (
		<div className="busy">
			<l-waveform size="32" stroke="2" speed="1" color="black" />
		</div>
	);
}
