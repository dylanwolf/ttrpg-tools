import { RootState, store } from "../AppStateStorage";
import {
	closeModalWindow as closeModalWindowInternal,
	showModalMessageWindow as openMessageWindowInternal,
	MessageWindowArgs,
	ModalUIState,
	UICloseArgs,
} from "./ModalUISlice";

/**
 * Redux selector to get the current UI state from useAppSelector.
 * @returns
 */
export const uiStateSelector =
	() =>
	(state: RootState): ModalUIState | undefined => {
		return state.modalUI.States.length > 0
			? state.modalUI.States[state.modalUI.States.length - 1]
			: undefined;
	};

/**
 * Updates the Redux UI state to close either the current modal window, or a specific modal window.
 * @param args
 */
export function closeModalWindow(args: UICloseArgs) {
	store.dispatch(closeModalWindowInternal(args));
}

/**
 * Updates the Redux UI to open a new modal window.
 * @param args
 */
export function openMessageWindow(args: MessageWindowArgs) {
	store.dispatch(openMessageWindowInternal(args));
}
