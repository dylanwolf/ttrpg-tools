import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import builderSourceReducer, {
	beginLoadingSourceData,
	finishLoadingSourceData,
} from "./BuilderSourceSlice";
import builderSessionReducer, {
	createBuilderSession,
	updateSessionStep,
} from "./BuilderSessionSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStepCollection, RootStepCollectionState } from "./StepModel";
import { getBuilderSource, getBuilderModel } from "./BuilderFactory";
import { useEffect } from "react";

export const store = configureStore({
	reducer: {
		builderSources: builderSourceReducer,
		builderSessions: builderSessionReducer,
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
		initialData?: TData | undefined
	) =>
	async (dispatch: AppDispatch, getState: () => RootState) => {
		//console.log(`ensureBuilderStateFor(${sessionKey}, ${builderKey})`);

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
		}
	};

export function useEnsureBuilderStateFor(
	sessionKey: string,
	builderKey: string,
	initialState?: any
) {
	const state = useAppSelector(builderStateSelector<any, any>(sessionKey));

	useEffect(() => {
		//console.log(`useEnsureBuilderStateFor useEffect()`);
		if (!state?.IsLoading && !state?.SourceData) {
			store.dispatch(
				ensureBuilderStateFor(sessionKey, builderKey, initialState)
			);
		}
	});
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
	<TSource, TData>(key: string) =>
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
