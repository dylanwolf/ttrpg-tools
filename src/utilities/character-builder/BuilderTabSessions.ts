import { getNewSessionId } from "../../helpers/sessionHelpers";
import { store, AppDispatch, RootState } from "../../state/AppStore";
import {
	getBuilderModel,
	getBuilderSource,
	ICharacterData,
} from "./BuilderFactory";
import {
	beginLoadingSourceData,
	finishLoadingSourceData,
	ICharacterBuilderSourceData,
} from "./BuilderSourceSlice";
import { RootStepCollection, RootStepCollectionState } from "./StepModel";
import {
	createTabSession,
	TabSessionState,
	updateTabSession,
} from "../../state/tab-sessions/TabSessionSlice";
import { UtilityKey } from "..";

export interface CharacterBuilderSessionState<TData extends ICharacterData> {
	BuilderKey: string;
	Character: TData;
	StepState: RootStepCollectionState;
}

export interface CharacterBuilderUpdate<TData extends ICharacterData> {
	NewCharacterData: TData;
	NewStepState: RootStepCollectionState;
}

export interface CharacterBuilderState<TSource, TData extends ICharacterData> {
	IsLoading: boolean;
	SourceData: TSource | undefined;
	Character: TData;
	StepState: RootStepCollectionState;
	Model: RootStepCollection<TSource, TData>;
}

function mergeCharacterBuilderUpdates<TData extends ICharacterData>(
	state: CharacterBuilderSessionState<TData>,
	update: CharacterBuilderUpdate<TData>
) {
	state = structuredClone(state);
	state.StepState = update.NewStepState;
	state.Character = update.NewCharacterData;
	return state;
}

function createCharacterBuilderSessionInternal(
	builderKey: string,
	autoSelect: boolean,
	initialState?: any
) {
	const sessionKey = getNewSessionId();
	store.dispatch(
		createCharacterBuilderStateInternal(
			sessionKey,
			builderKey,
			autoSelect,
			initialState
		)
	);
}

export function updateCharacterBuilderSession<TData extends ICharacterData>(
	sessionKey: string,
	changedStep: number,
	stepUpdates?: any
) {
	store.dispatch(
		updateCharacterBuilderSessionInternal(sessionKey, changedStep, stepUpdates)
	);
}

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
			IsLoading: sourceData.IsLoading || session.IsBusy,
			SourceData: sourceData,
			Character: session?.Content.Character,
			StepState: session?.Content.StepState,
			Model: getBuilderModel<TSource, TData>(builderKey),
		};
	};

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

const createCharacterBuilderStateInternal =
	<TSource extends ICharacterBuilderSourceData, TData extends ICharacterData>(
		sessionKey: string,
		builderKey: string,
		autoSelect: boolean,
		initialData?: TData | undefined
	) =>
	async (dispatch: AppDispatch, getState: () => RootState) => {
		var state = getState();
		var wasCreated = false;

		// Create a tab session if one doesn't already exist
		if (!state.tabSessions.Sessions[sessionKey]) {
			wasCreated = true;
			dispatch(
				createTabSession({
					SessionKey: sessionKey,
					IsBusy: true,
					TabType: UtilityKey.CHARACTER_BUILDER,
					Title: "Loading...",
					Content: undefined,
				})
			);
		}

		// Load builder source data if not already loaded
		var builderData: TSource;
		var builderDataState = state.builderSources.Sources[builderKey];
		if (!builderDataState?.Data && !builderDataState?.IsLoading) {
			dispatch(beginLoadingSourceData(builderKey));
			builderData = await getBuilderSource<TSource>(builderKey);
			dispatch(finishLoadingSourceData({ Key: builderKey, Data: builderData }));
		} else {
			builderData = state.builderSources.Sources[builderKey].Data;
		}

		// Create builder model data
		var model = getBuilderModel<TSource, TData>(builderKey);

		if (wasCreated) {
			var initialStepState = model.initializeRootState(sessionKey);
			var initialCharacterData = initialData || model.GetInitialCharacterData();

			var initialBuilderState: CharacterBuilderSessionState<TData> = {
				BuilderKey: builderKey,
				Character: initialCharacterData,
				StepState: initialStepState,
			};

			// Update with initial data
			dispatch(
				updateTabSession({
					SessionKey: sessionKey,
					Title: `${initialCharacterData.Title} (${builderData.__NAME__})`,
					IsBusy: false,
					Content: initialBuilderState,
				})
			);

			var updateObj = mergeCharacterBuilderUpdates(
				initialBuilderState,
				model.onRootStepUpdated(
					builderData,
					initialCharacterData,
					initialStepState,
					-1
				)
			);

			dispatch(
				updateTabSession({
					SessionKey: sessionKey,
					Title: `${updateObj.Character.Title} (${builderData.__NAME__})`,
					Content: updateObj,
					SelectTab: autoSelect,
				})
			);
		}
	};

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

	return import(`./builders/${builderKey}/index.ts`)
		.then(() =>
			createCharacterBuilderSessionInternal(builderKey, true, initialData)
		)
		.catch((ex) => {
			throw {
				Title: "Error loading character builder data",
				Message: `${ex}`,
			};
		});
}
