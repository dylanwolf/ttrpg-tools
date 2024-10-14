import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import builderSourceReducer from "../utilities/character-builder/BuilderSourceSlice";
import modalUiReducer from "./modal-ui/ModalUISlice";
import tabSessionReducer from "./tab-sessions/TabSessionSlice";
import { useDispatch, useSelector } from "react-redux";
import { saveTabMemory } from "./tab-sessions/TabMemory";

/* ----------------------------------------------------------------------
Redux data store
---------------------------------------------------------------------- */

const tabSessionStorage = (store: any) => (next: any) => (action: any) => {
	let result = next(action);
	if (
		[
			"TabSessions/createTabSession",
			"TabSessions/updateTabSession",
			"TabSessions/closeTabSession",
		].includes(action.type)
	) {
		console.log("saving tab memory");
		saveTabMemory(store.getState()?.tabSessions?.Sessions);
	}
	return result;
};

export const store = configureStore({
	reducer: {
		tabSessions: tabSessionReducer,
		builderSources: builderSourceReducer,
		modalUI: modalUiReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(tabSessionStorage),
});

export type AppStateStorage = typeof store;
export type RootState = ReturnType<AppStateStorage["getState"]>;
export type AppDispatch = AppStateStorage["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
	ThunkReturnType,
	RootState,
	unknown,
	Action
>;

export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
