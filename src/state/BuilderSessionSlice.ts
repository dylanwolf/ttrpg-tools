import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStepCollectionState } from "./StepModel";

export interface BuilderSessionStateCollection {
	Sessions: { [key: string]: BuilderSessionState<any> };
	CurrentSessionKey?: string | undefined;
}

const initialState: BuilderSessionStateCollection = {
	Sessions: {},
};

export interface CharacterDataBase {
	Title: string;
}

export interface BuilderSessionState<TData extends CharacterDataBase> {
	SessionKey: string;
	BuilderKey: string;
	Character: TData;
	StepState: RootStepCollectionState;
}

export interface SessionStateInitializePayload<TData> {
	SessionKey: string;
	BuilderKey: string;
	CharacterData: TData;
	StepState: RootStepCollectionState;
}

export interface SessionUpdate<TData> {
	NewStepState: RootStepCollectionState;
	NewCharacterData: TData;
}

export const characterDataSlice = createSlice({
	name: "BuilderSession",
	initialState,
	reducers: {
		createBuilderSession<TData>(
			state: BuilderSessionStateCollection,
			action: PayloadAction<SessionStateInitializePayload<TData>>
		) {
			console.log(
				`createBuilderSession(${action.payload.SessionKey}, ${action.payload.BuilderKey})`
			);

			if (!state.Sessions[action.payload.SessionKey]) {
				state.Sessions[action.payload.SessionKey] = {
					SessionKey: action.payload.SessionKey,
					BuilderKey: action.payload.BuilderKey,
					Character: action.payload.CharacterData,
					StepState: action.payload.StepState,
				};
			}
		},
		setCurrentSession(
			state: BuilderSessionStateCollection,
			action: PayloadAction<string | undefined>
		) {
			console.log(`setCurrentSession(${action.payload || "undefined"})`);
			if (!action.payload || state.Sessions[action.payload])
				state.CurrentSessionKey = action.payload;
		},
		updateSessionStep<TData>(
			state: BuilderSessionStateCollection,
			action: PayloadAction<SessionUpdate<TData>>
		) {
			console.log(
				`updateSessionStep(${action.payload.NewStepState.SessionKey})`
			);
			state.Sessions[action.payload.NewStepState.SessionKey].StepState =
				action.payload.NewStepState;
			state.Sessions[action.payload.NewStepState.SessionKey].Character =
				action.payload.NewCharacterData;
		},
		removeSession(
			state: BuilderSessionStateCollection,
			action: PayloadAction<string>
		) {
			console.log(`removeSession(${action.payload})`);
			delete state.Sessions[action.payload];
			if (action.payload === state.CurrentSessionKey) {
				state.CurrentSessionKey = Object.keys(state.Sessions)[0] || undefined;
			}
		},
	},
});

export const {
	createBuilderSession,
	updateSessionStep,
	setCurrentSession,
	removeSession,
} = characterDataSlice.actions;
export default characterDataSlice.reducer;
