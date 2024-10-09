import { RootState, store } from "../AppStore";
import {
	setCurrentTabSession as setCurrentTabSessionInternal,
	closeTabSession as closeTabSessionInternal,
	TabSessionStateCollection,
	TabSessionState,
} from "./TabSessionSlice";

export const tabSessionSelector =
	() =>
	(state: RootState): TabSessionStateCollection => {
		return state.tabSessions;
	};

export const currentTabSessionSelector =
	() =>
	(state: RootState): TabSessionState<any> | undefined => {
		return (
			(state.tabSessions.CurrentSessionKey &&
				state.tabSessions.Sessions[state.tabSessions.CurrentSessionKey]) ||
			undefined
		);
	};

export function setCurrentTabSession(sessionKey: string) {
	store.dispatch(setCurrentTabSessionInternal(sessionKey));
}

export function closeTabSession(sessionKey: string) {
	store.dispatch(closeTabSessionInternal(sessionKey));
}
