import { Fragment } from "react/jsx-runtime";
import { BusyIcon } from "../../../components/BusyIcon";
import "./CharacterBuilderProcess.css";
import { renderCharacterSheet } from "../BuilderFactory";
import { CharacterBuilderToolbar } from "./CharacterBuilderToolbar";
import { useState } from "react";
import {
	characterBuilderSessionSelector,
	updateCharacterBuilderSession,
} from "..//BuilderTabSessions";
import { useAppSelector } from "../../../state/AppStateStorage";

/**
 * Props for rendering the character builder step-by-step process.
 */
export interface CharacterBuilderProcessProps {
	sessionKey: string;
}

/**
 * Renders the character step-by-step process for the specified tab session.
 * @param props
 * @returns
 */
export function CharacterBuilderProcess(props: CharacterBuilderProcessProps) {
	const model = useAppSelector(
		characterBuilderSessionSelector(props.sessionKey)
	);
	const [showCharacterSheetMobile, setShowCharacterSheetMobile] =
		useState<boolean>(false);

	return !model ? (
		<>
			<BusyIcon />
		</>
	) : (
		<>
			<CharacterBuilderToolbar
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

/**
 * Renders the sequence of steps in the character builder process and routes updates back to the Redux store.
 * @param props
 * @returns
 */
function BuilderProcessInternal(props: CharacterBuilderProcessProps) {
	const model = useAppSelector(
		characterBuilderSessionSelector(props.sessionKey)
	);

	function triggerUpdate(index: number, stepUpdates: any) {
		updateCharacterBuilderSession(props.sessionKey, index, stepUpdates);
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
