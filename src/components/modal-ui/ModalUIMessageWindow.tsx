import { useAppSelector } from "../../state/AppStateStorage";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useDispatch } from "react-redux";
import { closeModalWindow } from "../../state/modal-ui/ModalUISlice";
import { uiStateSelector } from "../../state/modal-ui/ModalUI";

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
