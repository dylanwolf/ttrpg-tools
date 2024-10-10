import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import builderSourceReducer from "../utilities/character-builder/BuilderSourceSlice";
import modalUiReducer from "./modal-ui/ModalUISlice";
import tabSessionReducer from "./tab-sessions/TabSessionSlice";
import { useDispatch, useSelector } from "react-redux";

/* ----------------------------------------------------------------------
Redux data store
---------------------------------------------------------------------- */

export const store = configureStore({
	reducer: {
		tabSessions: tabSessionReducer,
		builderSources: builderSourceReducer,
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
