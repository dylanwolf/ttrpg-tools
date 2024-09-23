import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStepCollectionState } from "./StepModel";

export interface BuilderSessionStateCollection {
	Sessions: { [key: string]: BuilderSessionState<any> };
}

const initialState: BuilderSessionStateCollection = {
	Sessions: {},
};

export interface BuilderSessionState<TData> {
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
	},
});

export const { createBuilderSession, updateSessionStep } =
	characterDataSlice.actions;
export default characterDataSlice.reducer;
