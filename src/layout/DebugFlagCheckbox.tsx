export function DebugFlagCheckbox() {
	if (import.meta.env.PROD) return <></>;

	const windowAsAny = window as any;

	return (
		<div>
			<label>
				<input
					type="checkbox"
					value={windowAsAny.__DEBUG__}
					onClick={() => (windowAsAny.__DEBUG__ = !windowAsAny.__DEBUG__)}
				/>{" "}
				Debug
			</label>
		</div>
	);
}
