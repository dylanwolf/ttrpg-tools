import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ICharacterBuilderSourceData {
	__NAME__: string;
}

export interface CharacterBuilderSourceState<
	TData extends ICharacterBuilderSourceData
> {
	Data?: TData;
	IsLoading: boolean;
}

export interface CharacterBuilderSourceStateCollection {
	Sources: { [key: string]: CharacterBuilderSourceState<any> };
}

interface CharacterBuilderSourceLoadingFinishedPayload {
	Key: string;
	Data: any;
}

const initialState: CharacterBuilderSourceStateCollection = {
	Sources: {},
};

export const characterBuilderSourceData = createSlice({
	name: "CharacterBuilderSourceData",
	initialState,
	reducers: {
		beginLoadingSourceData(state, action: PayloadAction<string>) {
			console.debug(`beginLoadingSourceData(${action.payload})`);
			if (!state.Sources[action.payload]) {
				state.Sources[action.payload] = {
					IsLoading: true,
				};
			}
		},
		finishLoadingSourceData(
			state,
			action: PayloadAction<CharacterBuilderSourceLoadingFinishedPayload>
		) {
			console.debug(`finishLoadingSourceData(${action.payload.Key})`);

			state.Sources[action.payload.Key].Data = action.payload.Data;
			state.Sources[action.payload.Key].IsLoading = false;
		},
	},
});

export const { beginLoadingSourceData, finishLoadingSourceData } =
	characterBuilderSourceData.actions;
export default characterBuilderSourceData.reducer;
