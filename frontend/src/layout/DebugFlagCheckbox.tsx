import { useAppDispatch, useAppSelector } from "../state/AppStateStorage";
import { toggleDebugState } from "../state/tab-sessions/TabSessionSlice";

export function DebugFlagCheckbox() {
	if (import.meta.env.PROD) return <></>;

	const dispatch = useAppDispatch();
	const flagState = useAppSelector((state) => state.tabSessions.DebugState);

	const windowAsAny = window as any;
	windowAsAny.__DEBUG__ = flagState ? true : false;

	return (
		<div>
			<label>
				<input
					type="checkbox"
					checked={flagState || false}
					onChange={() => dispatch(toggleDebugState())}
				/>{" "}
				Debug
			</label>
		</div>
	);
}
