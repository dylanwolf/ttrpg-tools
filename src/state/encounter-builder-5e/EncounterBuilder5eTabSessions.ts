import {
	EncounterBuilder5eData,
	getInitialState,
	updateEncounterState,
} from "../../data/encounter-builder-5e";
import { getNewSessionId } from "../../helpers/sessionHelpers";
import { setBrowserTitle } from "../../layout/BrowserUtils";
import { RootState, store } from "../AppStore";
import {
	createTabSession,
	TabSessionState,
	updateTabSession,
} from "../tab-sessions/TabSessionSlice";

export interface EncounterBuilder5eState {
	SessionKey: string;
	Data: EncounterBuilder5eData;
}

export function createEncounterBuilder5eSession() {
	const sessionKey = getNewSessionId();
	var initialData = getInitialState();

	store.dispatch(
		createTabSession({
			SessionKey: sessionKey,
			Title: `${initialData.Title} (5e Encounter)`,
			TabType: "encounter-builder-5e",
			IsBusy: false,
			SelectTab: true,
			Content: initialData,
		})
	);
}

export function updateEncounterBuilder5eSession(
	sessionKey: string,
	data: EncounterBuilder5eData,
	updateFunc: (newData: EncounterBuilder5eData) => void
) {
	var newData = structuredClone(data);
	console.log(newData);
	updateFunc(newData);
	console.log(newData);
	updateEncounterState(newData);
	console.log(newData);

	var newTitle = `${newData.Title} (5e Encounter)`;

	store.dispatch(
		updateTabSession({
			SessionKey: sessionKey,
			Title: newTitle,
			Content: newData,
		})
	);
}

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
