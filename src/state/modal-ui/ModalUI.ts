import { RootState, store } from "../AppStore";
import {
	closeModalWindow as closeModalWindowInternal,
	showModalMessageWindow as openMessageWindowInternal,
	MessageWindowArgs,
	ModalUIState,
	UICloseArgs,
} from "./ModalUISlice";

export const uiStateSelector =
	() =>
	(state: RootState): ModalUIState | undefined => {
		return state.modalUI.States.length > 0
			? state.modalUI.States[state.modalUI.States.length - 1]
			: undefined;
	};

export function closeModalWindow(args: UICloseArgs) {
	store.dispatch(closeModalWindowInternal(args));
}

export function openMessageWindow(args: MessageWindowArgs) {
	store.dispatch(openMessageWindowInternal(args));
}
