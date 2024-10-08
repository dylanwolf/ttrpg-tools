import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import builderSourceReducer, {
	beginLoadingSourceData,
	finishLoadingSourceData,
	SourceDataBase,
} from "./BuilderSourceSlice";
import builderSessionReducer, {
	CharacterDataBase,
	createBuilderSession,
	setCurrentSession,
	updateSessionStep,
} from "./BuilderSessionSlice";
import modalUiReducer, {
	CloseArgs,
	closeModalWindow,
	MessageWindowArgs,
	ModalUIState,
	showModalMessageWindow,
} from "./ModalUISlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStepCollection, RootStepCollectionState } from "./StepModel";
import { getBuilderSource, getBuilderModel } from "./BuilderFactory";
import { v4 as uuid } from "uuid";
import { setBrowserTitle } from "../layout/BrowserUtils";

/* ----------------------------------------------------------------------
Redux data store
---------------------------------------------------------------------- */

export const store = configureStore({
	reducer: {
		builderSources: builderSourceReducer,
		builderSessions: builderSessionReducer,
		modalUI: modalUiReducer,
	},
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
	ThunkReturnType,
	RootState,
	unknown,
	Action
>;

export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/* ----------------------------------------------------------------------
Builder session functions
---------------------------------------------------------------------- */

export interface BuilderState<TSource, TData> {
	IsLoading: boolean;
	SourceData: TSource | undefined;
	Character: TData;
	StepState: RootStepCollectionState;
	Model: RootStepCollection<TSource, TData>;
}

export const ensureBuilderStateFor =
	<TSource, TData>(
		sessionKey: string,
		builderKey: string,
		autoSelect: boolean,
		initialData?: TData | undefined
	) =>
	async (dispatch: AppDispatch, getState: () => RootState) => {
		console.log(`ensureBuilderStateFor(${sessionKey}, ${builderKey})`);

		var state = getState();
		var builderData: TSource;

		if (state.builderSources.Sources[builderKey]?.IsLoading) return;

		if (
			!state.builderSources.Sources[builderKey]?.Data &&
			!state.builderSources.Sources[builderKey]?.IsLoading
		) {
			dispatch(beginLoadingSourceData(builderKey));
			builderData = await getBuilderSource<TSource>(builderKey);
			dispatch(finishLoadingSourceData({ Key: builderKey, Data: builderData }));
		} else {
			builderData = state.builderSources.Sources[builderKey].Data;
		}

		var model = getBuilderModel(builderKey);

		if (!state.builderSessions.Sessions[sessionKey]) {
			var initialStepState = model.initializeRootState(sessionKey);
			var initialCharacterData = initialData || model.GetInitialCharacterData();

			dispatch(
				createBuilderSession({
					SessionKey: sessionKey,
					BuilderKey: builderKey,
					CharacterData: initialCharacterData,
					StepState: initialStepState,
				})
			);

			dispatch(
				updateSessionStep(
					model.onRootStepUpdated(
						builderData,
						initialCharacterData,
						initialStepState,
						-1
					)
				)
			);

			if (autoSelect) {
				dispatch(setCurrentSession(sessionKey));
				setBrowserTitle(`${(builderData as any)?.__NAME__} Character Builder`);
			}
		}
	};

export function createSession(
	builderKey: string,
	autoSelect: boolean,
	initialState?: any
) {
	console.log(`createSession(${builderKey}, ${autoSelect})`);
	const sessionKey = uuid();
	store.dispatch(
		ensureBuilderStateFor(sessionKey, builderKey, autoSelect, initialState)
	);
}

export const builderSessionUpdate =
	(sessionKey: string, changedStep: number, stepUpdates?: any) =>
	async (dispatch: AppDispatch, getState: () => RootState) => {
		var state = getState();
		var session = state.builderSessions.Sessions[sessionKey];
		var model = getBuilderModel(session.BuilderKey);
		var sourceData = state.builderSources.Sources[session.BuilderKey].Data;

		dispatch(
			updateSessionStep(
				model.onRootStepUpdated(
					sourceData,
					session.Character,
					session.StepState,
					changedStep,
					stepUpdates
				)
			)
		);
	};

export const builderStateSelector =
	<TSource extends SourceDataBase, TData extends CharacterDataBase>(
		key: string
	) =>
	(state: RootState): BuilderState<TSource, TData> | undefined => {
		var session = state.builderSessions.Sessions[key];

		if (!session) return undefined;

		var sourceData =
			session?.BuilderKey &&
			state?.builderSources?.Sources[session.BuilderKey]?.Data;

		if (!sourceData) return undefined;

		return {
			IsLoading: sourceData.IsLoading,
			SourceData: sourceData,
			Character: session?.Character,
			StepState: session?.StepState,
			Model: getBuilderModel<TSource, TData>(session.BuilderKey),
		};
	};

export interface BuilderTabState {
	CurrentSessionKey?: string | undefined;
	Tabs: BuilderTab[];
}

export interface BuilderTab {
	SessionKey: string;
	BuilderName: string;
	CharacterTitle: string;
}

export const builderTabSelector =
	() =>
	(state: RootState): BuilderTabState => {
		var sessionKeys =
			(state.builderSessions &&
				state.builderSessions.Sessions &&
				Object.keys(state.builderSessions.Sessions)) ||
			[];

		return {
			CurrentSessionKey: state.builderSessions.CurrentSessionKey,
			Tabs: sessionKeys.map((key) => {
				var session = state.builderSessions.Sessions[key];
				var builderName =
					state.builderSources.Sources[session.BuilderKey]?.Data.__NAME__ ||
					"Loading...";

				return {
					SessionKey: key,
					CharacterTitle: session.Character.Title,
					BuilderName: builderName,
				};
			}),
		};
	};

/* ----------------------------------------------------------------------
Modal UI functions
---------------------------------------------------------------------- */

export const uiStateSelector =
	() =>
	(state: RootState): ModalUIState | undefined => {
		return state.modalUI.States.length > 0
			? state.modalUI.States[state.modalUI.States.length - 1]
			: undefined;
	};

export function closeUIWindow(args: CloseArgs) {
	store.dispatch(closeModalWindow(args));
}

export function openMessageWindow(args: MessageWindowArgs) {
	store.dispatch(showModalMessageWindow(args));
}
