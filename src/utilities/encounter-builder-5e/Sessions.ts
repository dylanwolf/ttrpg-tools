import {
	EncounterBuilder5eData,
	getInitialState,
	updateEncounterState,
} from "./Data";
import { getNewSessionId } from "../../helpers/sessionHelpers";
import { AppDispatch, RootState, store } from "../../state/AppStateStorage";
import {
	createTabSession,
	TabSessionState,
	updateTabSession,
} from "../../state/tab-sessions/TabSessionSlice";

/**
 * State stored in Redux for an encounter builder 5e session
 */
export interface EncounterBuilder5eState {
	SessionKey: string;
	Data: EncounterBuilder5eData;
}

/**
 * Creates a new encounter builder 5e session and saves it to the Redux store
 * @param data
 */
export function createEncounterBuilder5eSession(
	data?: EncounterBuilder5eData | undefined
) {
	const sessionKey = getNewSessionId();
	store.dispatch(createEncounterBuilder5eSessionInternal(sessionKey, data));
}

/**
 * Redux thunk to create an encounter builder 5e session
 */
const createEncounterBuilder5eSessionInternal =
	(sessionKey: string, initialData: EncounterBuilder5eData | undefined) =>
	async (dispatch: AppDispatch, getState: () => RootState) => {
		dispatch(
			createTabSession({
				SessionKey: sessionKey,
				Title: "Loading... (5e Encounter)",
				TabType: "encounter-builder-5e",
				IsBusy: true,
				SelectTab: true,
				Content: undefined,
			})
		);

		if (!initialData) initialData = getInitialState();
		updateEncounterState(initialData);

		dispatch(
			updateTabSession({
				SessionKey: sessionKey,
				Title: `${initialData.Title} (5e Encounter)`,
				IsBusy: false,
				Content: initialData,
			})
		);
	};

/**
 * Updates an encounter builder session in the Redux store
 * @param sessionKey
 * @param data
 * @param updateFunc
 */
export function updateEncounterBuilder5eSession(
	sessionKey: string,
	data: EncounterBuilder5eData,
	updateFunc: (newData: EncounterBuilder5eData) => void
) {
	var newData = structuredClone(data);
	updateFunc(newData);
	updateEncounterState(newData);

	var newTitle = `${newData.Title} (5e Encounter)`;

	store.dispatch(
		updateTabSession({
			SessionKey: sessionKey,
			Title: newTitle,
			Content: newData,
		})
	);
}

/**
 * Redux selector to retrieve an encounter builder 5e session for a given session key
 * @param sessionKey The session key to retrieve. If not provided, attempts to retrieve the currently selected session.
 * @returns
 */
export const encounterBuilder5eSessionSelector =
	(sessionKey?: string | undefined) =>
	(state: RootState): EncounterBuilder5eState | undefined => {
		if (!sessionKey) sessionKey = state.tabSessions.CurrentSessionKey;
		if (!sessionKey) return undefined;

		var session = state.tabSessions.Sessions[
			sessionKey
		] as TabSessionState<EncounterBuilder5eData>;
		if (!session || session.TabType !== "encounter-builder-5e")
			return undefined;

		return {
			SessionKey: sessionKey,
			Data: session.Content,
		};
	};
