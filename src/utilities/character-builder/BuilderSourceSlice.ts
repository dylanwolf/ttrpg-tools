import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { store } from "../../state/AppStateStorage";
import { fetchBuilderSource } from "./BuilderFactory";
import { setTimeoutAsync } from "../../helpers/setTimeoutHelper";

/**
 * Base interface for character builder source data
 */
export interface ICharacterBuilderSourceData {
	__NAME__: string;
}

/**
 * State for each loaded character builder source data file.
 */
export interface CharacterBuilderSourceState<
	TData extends ICharacterBuilderSourceData
> {
	/**
	 * Data loaded from the JSON file. This will be undefined if loading has not completed.
	 */
	Data?: TData;
	/**
	 * Flag that indicates whether the given data is being loaded.
	 */
	IsLoading: boolean;
}

/**
 * Data that is stored in the CharacterBuilderSourceData Redux slice.
 */
export interface CharacterBuilderSourceStateCollection {
	Sources: { [key: string]: CharacterBuilderSourceState<any> };
}

/**
 * Args passed in to the action indicating a source download has finished.
 */
interface CharacterBuilderSourceLoadingFinishedPayload {
	Key: string;
	Data: any;
}

/**
 * Initial state for the slice.
 */
const initialState: CharacterBuilderSourceStateCollection = {
	Sources: {},
};

/**
 * Redux slice for tracking character builder source data.
 */
export const characterBuilderSourceData = createSlice({
	name: "CharacterBuilderSourceData",
	initialState,
	reducers: {
		/**
		 * Indicates that source data has begun loading. This prevents other character builder sessions from starting a new download.
		 * @param state
		 * @param action The builder key
		 */
		beginLoadingSourceData(state, action: PayloadAction<string>) {
			console.debug(`beginLoadingSourceData(${action.payload})`);
			if (!state.Sources[action.payload]) {
				state.Sources[action.payload] = {
					IsLoading: true,
				};
			}
		},
		/**
		 * Indicates that source data has finished loading and can be used.
		 * @param state
		 * @param action
		 */
		finishLoadingSourceData(
			state,
			action: PayloadAction<CharacterBuilderSourceLoadingFinishedPayload>
		) {
			console.debug(`finishLoadingSourceData(${action.payload.Key})`);

			state.Sources[action.payload.Key].Data = action.payload.Data;
			state.Sources[action.payload.Key].IsLoading = false;
		},
		/**
		 * Removes the source data object with the given builder key. This is used to handle source data downloads that have not completed in a reasonable amount of time.
		 * @param state
		 * @param action
		 */
		removeSourceData(state, action: PayloadAction<string>) {
			delete state.Sources[action.payload];
		},
	},
});

/**
 * Time in milliseconds that getBuilderSourceData should wait to re-check source data downloads in progress.
 */
const BUILDER_DATA_POLL_MS = 500;
/**
 * Number of times that getBuilderSourceData should poll for source data downloads in progress before restarting them.
 */
const BUILDER_DATA_POLL_COUNT = 5;

/**
 * Gets source data for the given builder key. This function handles three possible states:
 *
 * - Source data download has not started: Starts a new download and resolves the promise when it finishes.
 * - Source data download has started but not completed: Polls ever half-second to check if the download has completed; after 5 tries it clears that download from Redux state and starts over.
 * - Source data download has completed: Return the results from Redux state.
 * @param builderKey
 * @returns
 */
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
