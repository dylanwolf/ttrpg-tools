import { uiStateSelector, useAppSelector } from "../../state/AppStore";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useDispatch } from "react-redux";
import { closeModalWindow } from "../../state/ModalUISlice";

export function ModalUIMessageWindow() {
	const state = useAppSelector(uiStateSelector());
	const dispatch = useDispatch();

	if (!state) return <></>;

	function handleClose() {
		dispatch(closeModalWindow({}));
	}

	return (
		<Modal show={true} onHide={handleClose}>
			{state.Title ? (
				<Modal.Header closeButton>{state.Title}</Modal.Header>
			) : (
				<></>
			)}
			<Modal.Body>{state.Message}</Modal.Body>
			<Modal.Footer>
				<Button variant="primary" onClick={handleClose}>
					{state.CloseButton || "OK"}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
