import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StepCollectionState } from "./StepModel";

export interface BuilderSessionStateCollection {
	Sessions: { [key: string]: BuilderSessionState<any> };
}

const initialState: BuilderSessionStateCollection = {
	Sessions: {},
};

export interface BuilderSessionState<TData> {
	Key: string;
	BuilderKey: string;
	Character: TData;
	StepState: StepCollectionState;
}

export interface SessionStateInitializePayload<TData> {
	Key: string;
	BuilderKey: string;
	CharacterData: TData;
	StepState: StepCollectionState;
}

export interface SessionUpdate<TData> {
	Key: string;
	NewStepState: StepCollectionState;
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
				`createBuilderSession(${action.payload.Key}, ${action.payload.BuilderKey})`
			);

			if (!state.Sessions[action.payload.Key]) {
				state.Sessions[action.payload.Key] = {
					Key: action.payload.Key,
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
			console.log(`updateSessionStep(${action.payload.Key})`);
			state.Sessions[action.payload.Key].StepState =
				action.payload.NewStepState;
			state.Sessions[action.payload.Key].Character =
				action.payload.NewCharacterData;
		},
	},
});

export const { createBuilderSession, updateSessionStep } =
	characterDataSlice.actions;
export default characterDataSlice.reducer;
