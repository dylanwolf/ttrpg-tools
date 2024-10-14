import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import builderSourceReducer from "../utilities/character-builder/BuilderSourceSlice";
import modalUiReducer from "./modal-ui/ModalUISlice";
import tabSessionReducer from "./tab-sessions/TabSessionSlice";
import { useDispatch, useSelector } from "react-redux";
import { tabSessionStorageMiddleware } from "./tab-sessions/TabMemory";

/* ----------------------------------------------------------------------
Redux data store
---------------------------------------------------------------------- */

export const store = configureStore({
	reducer: {
		tabSessions: tabSessionReducer,
		builderSources: builderSourceReducer,
		modalUI: modalUiReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat([tabSessionStorageMiddleware]),
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
