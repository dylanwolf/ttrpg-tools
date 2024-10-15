import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Interface for data stored in the ModelUI Redux slice.
 */
interface ModalUIStackState {
	States: ModalUIState[];
}

/**
 * State of a single UI in ModalUI.
 */
export interface ModalUIState {
	ID?: string | undefined;
	Title?: string | undefined;
	Window?: "message" | undefined;
	Message?: string | undefined;
	CloseButton?: string | undefined;
}

/**
 * Arguments passed to the action to close a UI window.
 */
export interface UICloseArgs {
	ID?: string | undefined;
}

/**
 * Arguments passed to the action to show a message window.
 */
export interface MessageWindowArgs {
	ID?: string | undefined;
	Title?: string | undefined;
	Message: string;
	CloseButton?: string | undefined;
}

/**
 * Initial state for the ModalUI Redux slice.
 */
const initialValue: ModalUIStackState = {
	States: [],
};

/**
 * Redux slice for storing data about modal UI controls.
 */
export const modalUiSlice = createSlice({
	name: "ModalUI",
	initialState: initialValue,
	reducers: {
		/**
		 * Close either a specific modal UI element, or the latest UI element.
		 * @param state
		 * @param action
		 * @returns
		 */
		closeModalWindow(
			state: ModalUIStackState,
			action: PayloadAction<UICloseArgs>
		) {
			if (action.payload.ID) {
				var match = state.States.filter((x) => x.ID === action.payload.ID)[0];
				if (match) {
					state.States.splice(state.States.indexOf(match), 1);
				}
				return;
			}

			state.States.splice(state.States.length - 1, 1);
		},
		/**
		 * Display the modal message window.
		 * @param state
		 * @param action
		 */
		showModalMessageWindow(
			state: ModalUIStackState,
			action: PayloadAction<MessageWindowArgs>
		) {
			state.States.push({
				ID: action.payload.ID,
				Title: action.payload.Title,
				Window: "message",
				Message: action.payload.Message,
				CloseButton: action.payload.CloseButton,
			});
		},
	},
});

export const { closeModalWindow, showModalMessageWindow } =
	modalUiSlice.actions;
export default modalUiSlice.reducer;
