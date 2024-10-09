import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState, store } from "../AppStore";
import { setBrowserTitle } from "../../layout/BrowserUtils";

/* ----------------------------------------------------------------------------------------
State
---------------------------------------------------------------------------------------- */
export type TabType = "character-builder";

export interface TabSessionStateCollection {
	Sessions: { [key: string]: TabSessionState<unknown> };
	CurrentSessionKey?: string | undefined;
}

export interface TabSessionState<TData> {
	SessionKey: string;
	IsBusy: boolean;
	TabType: TabType;
	Title: string;
	Content: TData;
}

export interface TabSessionUpdatePayload<TData> {
	SessionKey: string;
	IsBusy?: boolean | undefined;
	Title?: string | undefined;
	Content?: TData | undefined;
	SelectTab?: boolean | undefined;
}

export interface TabSessionCreatePayload<TData> {
	SessionKey: string;
	IsBusy: boolean;
	TabType: TabType;
	Title: string;
	Content: TData;
	SelectTab?: boolean | undefined;
}

const initialState: TabSessionStateCollection = {
	Sessions: {},
};

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

export const tabSessionSlice = createSlice({
	name: "TabSessions",
	initialState,
	reducers: {
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
		setCurrentTabSession(
			state: TabSessionStateCollection,
			action: PayloadAction<string>
		) {
			if (action.payload && state.Sessions[action.payload]) {
				state.CurrentSessionKey = action.payload;
				setBrowserTitle(state.Sessions[action.payload].Title);
			}
		},
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
					setBrowserTitle(
						action.payload.Title ||
							state.Sessions[action.payload.SessionKey].Title
					);
				}
			}
		},
		closeTabSession(
			state: TabSessionStateCollection,
			action: PayloadAction<string>
		) {
			delete state.Sessions[action.payload];
			if (action.payload === state.CurrentSessionKey) {
				state.CurrentSessionKey = Object.keys(state.Sessions)[0] || undefined;
			}
		},
	},
});

/* ----------------------------------------------------------------------------------------
Selectors and actions
---------------------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------------------
Exports
---------------------------------------------------------------------------------------- */

export const {
	createTabSession,
	setCurrentTabSession,
	updateTabSession,
	closeTabSession,
} = tabSessionSlice.actions;
export default tabSessionSlice.reducer;
