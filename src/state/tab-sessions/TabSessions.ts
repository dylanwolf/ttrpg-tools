import { RootState, store } from "../AppStateStorage";
import {
	setCurrentTabSession as setCurrentTabSessionInternal,
	closeTabSession as closeTabSessionInternal,
	TabSessionStateCollection,
	TabSessionState,
} from "./TabSessionSlice";

/**
 * Redux selector to get all tab sessions.
 * @returns
 */
export const tabSessionSelector =
	() =>
	(state: RootState): TabSessionStateCollection => {
		return state.tabSessions;
	};

/**
 * Redux selector to get the state for the currently selected tab.
 * @returns
 */
export const currentTabSessionSelector =
	() =>
	(state: RootState): TabSessionState<any> | undefined => {
		return (
			(state.tabSessions.CurrentSessionKey &&
				state.tabSessions.Sessions[state.tabSessions.CurrentSessionKey]) ||
			undefined
		);
	};

/**
 * Updates the Redux tab session state to set the currently selected tab.
 * @param sessionKey
 */
export function setCurrentTabSession(sessionKey: string) {
	store.dispatch(setCurrentTabSessionInternal(sessionKey));
}

/**
 * Updates the Redux tab session state to close a tab.
 * @param sessionKey
 */
export function closeTabSession(sessionKey: string) {
	store.dispatch(closeTabSessionInternal(sessionKey));
}
