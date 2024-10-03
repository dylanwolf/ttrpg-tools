import { Fragment } from "react/jsx-runtime";
import {
	builderSessionUpdate,
	builderStateSelector,
	useAppDispatch,
	useAppSelector,
} from "../../state/AppStore";
import { BusyIcon } from "../BusyIcon";
import "./BuilderProcess.css";
import { renderCharacterSheet } from "../../state/BuilderFactory";
import { BuilderCharacterToolbar } from "./BuilderCharacterToolbar";
import { useState } from "react";

export interface BuilderProcessProps {
	sessionKey: string;
}

export function BuilderProcess(props: BuilderProcessProps) {
	const model = useAppSelector(builderStateSelector(props.sessionKey));
	const [showCharacterSheetMobile, setShowCharacterSheetMobile] =
		useState<boolean>(false);

	return !model ? (
		<>
			<BusyIcon />
		</>
	) : (
		<>
			<BuilderCharacterToolbar
				sessionKey={props.sessionKey}
				showCharacterSheetMobile={showCharacterSheetMobile}
				setShowCharacterSheetMobile={setShowCharacterSheetMobile}
			/>
			<div className="builder">
				<div
					className={`builder-process${
						showCharacterSheetMobile ? " d-none d-lg-block" : ""
					}`}
				>
					<BuilderProcessInternal sessionKey={props.sessionKey} />
				</div>
				<div
					className={`builder-character-sheet${
						!showCharacterSheetMobile ? " d-none d-lg-block" : ""
					}`}
				>
					{renderCharacterSheet(
						model.Model.BuilderKey,
						model.SourceData,
						model.Character
					)}
				</div>
			</div>
		</>
	);
}

function BuilderProcessInternal(props: BuilderProcessProps) {
	const model = useAppSelector(builderStateSelector(props.sessionKey));
	const dispatch = useAppDispatch();

	function triggerUpdate(index: number, stepUpdates: any) {
		dispatch(builderSessionUpdate(props.sessionKey, index, stepUpdates));
	}

	return (
		<div className={`builder-sequence builder-${model?.Model.BuilderKey}`}>
			{model?.Model.ByIndex.filter(
				(step) =>
					step.Index <= model.StepState.CurrentStep &&
					model.StepState.Steps[step.Index].IsVisible
			).map((step) => (
				<Fragment key={`Step-${props.sessionKey}-${step.Index}`}>
					{step.render(model.StepState.Steps[step.Index], triggerUpdate)}
				</Fragment>
			))}
		</div>
	);
}
