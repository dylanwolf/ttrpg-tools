import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModalUIStackState {
	States: ModalUIState[];
}

export interface ModalUIState {
	ID?: string | undefined;
	Title?: string | undefined;
	Window?: "message" | undefined;
	Message?: string | undefined;
	CloseButton?: string | undefined;
}

export interface UICloseArgs {
	ID?: string | undefined;
}

export interface MessageWindowArgs {
	ID?: string | undefined;
	Title?: string | undefined;
	Message: string;
	CloseButton?: string | undefined;
}

const initialValue: ModalUIStackState = {
	States: [],
};

export const modalUiSlice = createSlice({
	name: "ModalUI",
	initialState: initialValue,
	reducers: {
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
