import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { store } from "../../state/AppStateStorage";
import { fetchBuilderSource } from "./BuilderFactory";
import { setTimeoutAsync } from "../../helpers/setTimeoutHelper";

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
		removeSourceData(state, action: PayloadAction<string>) {
			delete state.Sources[action.payload];
		},
	},
});

const BUILDER_DATA_POLL_MS = 500;
const BUILDER_DATA_POLL_COUNT = 5;

export async function getBuilderSourceData(builderKey: string): Promise<any> {
	var sourceData = store.getState().builderSources.Sources[builderKey];

	if (!sourceData) {
		store.dispatch(beginLoadingSourceData(builderKey));
		try {
			var builderData = await fetchBuilderSource<any>(builderKey);
		} catch (ex) {
			store.dispatch(
				characterBuilderSourceData.actions.removeSourceData(builderKey)
			);
			throw ex;
		}
		store.dispatch(
			finishLoadingSourceData({ Key: builderKey, Data: builderData })
		);
		return builderData;
	} else if (sourceData.IsLoading) {
		var count = BUILDER_DATA_POLL_COUNT;

		while (count > 0) {
			await setTimeoutAsync(BUILDER_DATA_POLL_MS);
			sourceData = store.getState().builderSources.Sources[builderKey];

			if (!sourceData) return await getBuilderSourceData(builderKey);
			else if (!sourceData.IsLoading) return sourceData.Data;

			count--;
		}

		store.dispatch(
			characterBuilderSourceData.actions.removeSourceData(builderKey)
		);
		return getBuilderSourceData(builderKey);
	} else if (!sourceData.IsLoading) {
		return sourceData.Data;
	}
}

export const { beginLoadingSourceData, finishLoadingSourceData } =
	characterBuilderSourceData.actions;
export default characterBuilderSourceData.reducer;
