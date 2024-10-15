import { getNewSessionId } from "../../helpers/sessionHelpers";
import { store, AppDispatch, RootState } from "../../state/AppStateStorage";
import { getBuilderModel, ICharacterData } from "./BuilderFactory";
import {
	getBuilderSourceData,
	ICharacterBuilderSourceData,
} from "./BuilderSourceSlice";
import { RootStepCollection, RootStepCollectionState } from "./StepModel";
import {
	createTabSession,
	TabSessionState,
	updateTabSession,
} from "../../state/tab-sessions/TabSessionSlice";
import { createTabSavedState, UtilityKey } from "..";
import { downloadAsJson } from "../../helpers/JsonFileUtils";

/**
 * Basic state data for the character builder. This is what is stored in the Redux slice.
 */
export interface CharacterBuilderSessionState<TData extends ICharacterData> {
	BuilderKey: string;
	Character: TData;
	StepState: RootStepCollectionState;
}

/**
 * Args passed into the action that updates character builder state data in the Redux slice. Character and StepState will be replaced with the new values.
 */
export interface CharacterBuilderUpdate<TData extends ICharacterData> {
	NewCharacterData: TData;
	NewStepState: RootStepCollectionState;
}

/**
 * The full character builder state returned by the selector. Source data is retrieved from the source data Redux slice and the step model is returned from BuilderFactory.
 */
export interface CharacterBuilderState<TSource, TData extends ICharacterData>
	extends CharacterBuilderSessionState<TData> {
	IsLoading: boolean;
	SourceData: TSource | undefined;
	Model: RootStepCollection<TSource, TData>;
}

/**
 * Creates a new copy of session state and replaces its contents with the new versions provided in the update.
 * @param state
 * @param update
 * @returns
 */
function mergeCharacterBuilderUpdates<TData extends ICharacterData>(
	state: CharacterBuilderSessionState<TData>,
	update: CharacterBuilderUpdate<TData>
) {
	state = structuredClone(state);
	state.StepState = update.NewStepState;
	state.Character = update.NewCharacterData;
	return state;
}

/**
 * Updates the specified session in Redux step state. This will re-process all steps in the builder, return updates, and save them to the slice.
 * @param sessionKey
 * @param changedStep
 * @param stepUpdates
 */
export async function updateCharacterBuilderSession(
	sessionKey: string,
	changedStep: number,
	stepUpdates?: any
) {
	store.dispatch(
		updateCharacterBuilderSessionInternal(sessionKey, changedStep, stepUpdates)
	);
}

/**
 * Redux selector for getting a character builder session. This retrieves not only the data in the Tab Session slice, but the associated source data and step model.
 * @param sessionKey
 * @returns
 */
export const characterBuilderSessionSelector =
	<TSource extends ICharacterBuilderSourceData, TData extends ICharacterData>(
		sessionKey?: string | undefined
	) =>
	(state: RootState): CharacterBuilderState<TSource, TData> | undefined => {
		if (!sessionKey) sessionKey = state.tabSessions.CurrentSessionKey;
		if (!sessionKey) return undefined;

		var session = state.tabSessions.Sessions[sessionKey] as TabSessionState<
			CharacterBuilderSessionState<TData>
		>;
		if (!session || session.TabType !== UtilityKey.CHARACTER_BUILDER)
			return undefined;

		var builderKey = session.Content.BuilderKey;
		var sourceData = state?.builderSources?.Sources[builderKey]?.Data;

		if (!sourceData) return undefined;

		return {
			BuilderKey: builderKey,
			IsLoading: sourceData.IsLoading || session.IsBusy,
			SourceData: sourceData,
			Character: session?.Content.Character,
			StepState: session?.Content.StepState,
			Model: getBuilderModel<TSource, TData>(builderKey),
		};
	};

/**
 * Redux thunk to update a character builder session. This will re-process all steps in the builder, return updates, and save them to the slice.
 * @param sessionKey
 * @param changedStep
 * @param stepUpdates
 * @returns
 */
const updateCharacterBuilderSessionInternal =
	<TData extends ICharacterData>(
		sessionKey: string,
		changedStep: number,
		stepUpdates?: any
	) =>
	async (dispatch: AppDispatch, getState: () => RootState) => {
		var state = getState();
		var session = state.tabSessions.Sessions[sessionKey]
			.Content as CharacterBuilderSessionState<TData>;
		var model = getBuilderModel<unknown, TData>(session.BuilderKey);
		var sourceData = state.builderSources.Sources[session.BuilderKey].Data;

		var updateObj = model.onRootStepUpdated(
			sourceData,
			session.Character,
			session.StepState,
			changedStep,
			stepUpdates
		);

		dispatch(
			updateTabSession({
				SessionKey: sessionKey,
				Title: `${updateObj.NewCharacterData.Title} (${sourceData.__NAME__})`,
				Content: mergeCharacterBuilderUpdates(session, updateObj),
			})
		);
	};

/**
 * Redux thunk to create a new character builder tab session state. This will create the busy tab session, dynamically load the builder code, load builder source data, and initialize the step model by processing every step.
 * @param sessionKey
 * @param builderKey
 * @param autoSelect
 * @param initialData
 * @returns
 */
const createCharacterBuilderStateInternal =
	<TSource extends ICharacterBuilderSourceData, TData extends ICharacterData>(
		sessionKey: string,
		builderKey: string,
		autoSelect: boolean,
		initialData?: TData | undefined
	) =>
	async (dispatch: AppDispatch, getState: () => RootState) => {
		var state = getState();

		// Create a tab session if one doesn't already exist
		if (!state.tabSessions.Sessions[sessionKey]) {
			dispatch(
				createTabSession({
					SessionKey: sessionKey,
					IsBusy: true,
					TabType: UtilityKey.CHARACTER_BUILDER,
					Title: `Loading... (${builderKey})`,
					Content: undefined,
					SelectTab: autoSelect,
				})
			);
		}

		var [importResult, builderData] = await Promise.all([
			import(`./builders/${builderKey}/index.ts`),
			getBuilderSourceData(builderKey),
		]);

		// Load builder source data if not already loaded
		if (builderData) {
			// Create builder model data
			var model = getBuilderModel<any, any>(builderKey);

			var initialStepState = model.initializeRootState(sessionKey);
			if (!initialData) initialData = model.GetInitialCharacterData();

			var initialBuilderState: CharacterBuilderSessionState<any> = {
				BuilderKey: model.BuilderKey,
				Character: initialData,
				StepState: initialStepState,
			};

			// Update with initial data
			dispatch(
				updateTabSession({
					SessionKey: sessionKey,
					Title: `${initialData?.Title} (${model.BuilderKey})`,
					IsBusy: false,
					Content: initialBuilderState,
				})
			);

			var updateObj = mergeCharacterBuilderUpdates(
				initialBuilderState,
				model.onRootStepUpdated(builderData, initialData, initialStepState, -1)
			);

			dispatch(
				updateTabSession({
					SessionKey: sessionKey,
					Title: `${updateObj.Character.Title} (${builderData.__NAME__})`,
					Content: updateObj,
				})
			);
		}
	};

/**
 * Creates a new character builder tab session in Redux state.
 * @param builderKey
 * @param initialData
 * @returns
 */
export async function createCharacterBuilderSession(
	builderKey: string,
	initialData?: any
) {
	if (builderKey.match(/[^a-z0-9\-]/)) {
		console.error(`Invalid builder key ${builderKey}`);
		return Promise.reject({
			Title: "Error opening character builder",
			Message: `Invalid builder key: ${builderKey}. This character builder may not be supported.`,
		});
	}

	try {
		const sessionKey = getNewSessionId();
		await store.dispatch(
			createCharacterBuilderStateInternal(
				sessionKey,
				builderKey,
				true,
				initialData
			)
		);
	} catch (ex) {
		throw {
			Title: "Error loading character builder data",
			Message: `${ex}`,
		};
	}
}

/**
 * Downloads character builder saved state JSON using the browser's File API.
 * @param state
 */
export function downloadCharacterBuilderJson(
	state: CharacterBuilderState<any, any> | undefined
) {
	if (state) {
		downloadAsJson(
			`${state.Character.Title}-${state.Model.BuilderKey}.json`,
			createTabSavedState(UtilityKey.CHARACTER_BUILDER, state)
		);
	}
}
