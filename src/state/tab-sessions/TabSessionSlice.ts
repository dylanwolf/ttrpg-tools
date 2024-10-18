import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setBrowserTitle } from "../../layout/BrowserUtils";

/* ----------------------------------------------------------------------------------------
State
---------------------------------------------------------------------------------------- */

/**
 * Interface for data stored in the TabSessions Redux slice.
 */

export interface TabSessionStateCollection {
	Sessions: { [key: string]: TabSessionState<unknown> };
	CurrentSessionKey?: string | undefined;
}

/**
 * State of a single tab in TabSessions
 */
export interface TabSessionState<TData> {
	SessionKey: string;
	IsBusy: boolean;
	TabType: string;
	Title: string;
	Content: TData;
}

/**
 * Arguments passed to the action to update a session
 */
export interface TabSessionUpdatePayload<TData> {
	SessionKey: string;
	IsBusy?: boolean | undefined;
	Title?: string | undefined;
	Content?: TData | undefined;
	SelectTab?: boolean | undefined;
}

/**
 * Arguments passed to the action to create a session
 */
export interface TabSessionCreatePayload<TData> {
	SessionKey: string;
	IsBusy: boolean;
	TabType: string;
	Title: string;
	Content: TData;
	SelectTab?: boolean | undefined;
}

/**
 * Initial state for the TabSessions Redux slice.
 */
const initialState: TabSessionStateCollection = {
	Sessions: {},
};

/**
 * Creates new TabSessionState object from the given payload.
 * @param payload
 * @returns
 */
function createTabSessionFromPayload(
	payload: TabSessionCreatePayload<unknown>
): TabSessionState<unknown> {
	return {
		SessionKey: payload.SessionKey,
		IsBusy: payload.IsBusy,
		Title: payload.Title,
		Content: payload.Content,
		TabType: payload.TabType,
	};
}

/**
 * Updates a TabSessionState object from the given payload.
 * @param state
 * @param payload
 */
function updateTabSessionStateFromPayload(
	state: TabSessionState<unknown>,
	payload: TabSessionUpdatePayload<unknown>
) {
	if (payload.Title !== undefined) state.Title = payload.Title;
	if (payload.IsBusy !== undefined) state.IsBusy = payload.IsBusy;
	if (payload.Content !== undefined) state.Content = payload.Content;
}

/* ----------------------------------------------------------------------------------------
Slice
---------------------------------------------------------------------------------------- */

/**
 * Redux slice for storing data about tab sessions.
 */
export const tabSessionSlice = createSlice({
	name: "TabSessions",
	initialState,
	reducers: {
		/**
		 * Create a new tab session
		 * @param state
		 * @param action
		 */
		createTabSession(
			state: TabSessionStateCollection,
			action: PayloadAction<TabSessionCreatePayload<unknown>>
		) {
			if (!state.Sessions[action.payload.SessionKey]) {
				state.Sessions[action.payload.SessionKey] = createTabSessionFromPayload(
					action.payload
				);
				if (action.payload.SelectTab) {
					state.CurrentSessionKey = action.payload.SessionKey;
					setBrowserTitle(
						action.payload.Title ||
							state.Sessions[action.payload.SessionKey].Title
					);
				}
			}
		},
		/**
		 * Changes the currently selected tab session
		 * @param state
		 * @param action
		 */
		setCurrentTabSession(
			state: TabSessionStateCollection,
			action: PayloadAction<string>
		) {
			if (action.payload && state.Sessions[action.payload]) {
				state.CurrentSessionKey = action.payload;
			}

			if (state.CurrentSessionKey === action.payload) {
				setBrowserTitle(state.Sessions[action.payload].Title);
			}
		},
		/**
		 * Updates data for the specified tab session
		 * @param state
		 * @param action
		 */
		updateTabSession(
			state: TabSessionStateCollection,
			action: PayloadAction<TabSessionUpdatePayload<unknown>>
		) {
			if (state.Sessions[action.payload.SessionKey]) {
				updateTabSessionStateFromPayload(
					state.Sessions[action.payload.SessionKey],
					action.payload
				);

				if (action.payload.SelectTab) {
					state.CurrentSessionKey = action.payload.SessionKey;
				}

				if (state.CurrentSessionKey === action.payload.SessionKey) {
					setBrowserTitle(
						action.payload.Title ||
							state.Sessions[action.payload.SessionKey].Title
					);
				}
			}
		},
		/**
		 * Close the specified tab session
		 * @param state
		 * @param action
		 */
		closeTabSession(
			state: TabSessionStateCollection,
			action: PayloadAction<string>
		) {
			delete state.Sessions[action.payload];
			if (action.payload === state.CurrentSessionKey) {
				state.CurrentSessionKey = Object.keys(state.Sessions)[0] || undefined;
				setBrowserTitle(
					state.CurrentSessionKey && state.Sessions[state.CurrentSessionKey]
						? state.Sessions[state.CurrentSessionKey].Title
						: ""
				);
			}
		},
	},
});

export const {
	createTabSession,
	setCurrentTabSession,
	updateTabSession,
	closeTabSession,
} = tabSessionSlice.actions;
export default tabSessionSlice.reducer;
