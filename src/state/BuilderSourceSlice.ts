import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SourceDataBase {
	__NAME__: string;
}

export interface BuilderSourceState<TData extends SourceDataBase> {
	Data?: TData;
	IsLoading: boolean;
}

export interface BuilderSourceStateCollection {
	Sources: { [key: string]: BuilderSourceState<any> };
}

interface BuilderSourceLoadingFinishedPayload {
	Key: string;
	Data: any;
}

const initialState: BuilderSourceStateCollection = {
	Sources: {},
};

export const builderDataSlice = createSlice({
	name: "BuilderSource",
	initialState,
	reducers: {
		beginLoadingSourceData(state, action: PayloadAction<string>) {
			console.log(`beginLoadingSourceData(${action.payload})`);
			if (!state.Sources[action.payload]) {
				state.Sources[action.payload] = {
					IsLoading: true,
				};
			}
		},
		finishLoadingSourceData(
			state,
			action: PayloadAction<BuilderSourceLoadingFinishedPayload>
		) {
			console.log(`finishLoadingSourceData(${action.payload.Key})`);

			state.Sources[action.payload.Key].Data = action.payload.Data;
			state.Sources[action.payload.Key].IsLoading = false;
		},
	},
});

export const { beginLoadingSourceData, finishLoadingSourceData } =
	builderDataSlice.actions;
export default builderDataSlice.reducer;
