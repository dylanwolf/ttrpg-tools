import { Fragment } from "react/jsx-runtime";
import {
	builderSessionUpdate,
	builderStateSelector,
	useAppDispatch,
	useAppSelector,
	useEnsureBuilderStateFor,
} from "../models/AppStore";
import { BusyIcon } from "./BusyIcon";
import "./BuilderProcess.css";
import { renderCharacterSheet } from "../models/BuilderFactory";
import { DumpObject } from "./DumpObject";
import { SourceData, SpellGrouping } from "../data/ryuutama/SourceData";

export interface BuilderProcessProps {
	sessionKey: string;
}

export function BuilderProcess(props: BuilderProcessProps) {
	const model = useAppSelector(builderStateSelector(props.sessionKey));

	useEnsureBuilderStateFor(props.sessionKey, "ryuutama");

	return !model ? (
		<>
			<BusyIcon />
		</>
	) : (
		<div className="builder">
			<div className="builder-process">
				<BuilderProcessInternal sessionKey={props.sessionKey} />
			</div>
			<div className="builder-character-sheet">
				{renderCharacterSheet(
					model.Model.BuilderKey,
					model.SourceData,
					model.Character
				)}
			</div>
		</div>
	);
}

function BuilderProcessInternal(props: BuilderProcessProps) {
	const model = useAppSelector(builderStateSelector(props.sessionKey));
	const dispatch = useAppDispatch();

	function triggerUpdate(index: number, stepUpdates: any) {
		dispatch(builderSessionUpdate(props.sessionKey, index, stepUpdates));
	}

	return (
		<div className={`builder-${model?.Model.BuilderKey}`}>
			{model?.Model.ByIndex.filter(
				(step) =>
					step.Index <= model.StepState.CurrentStep &&
					model.StepState.Steps[step.Index].IsVisible
			).map((step) => (
				<Fragment key={`Step-${props.sessionKey}-${step.Index}`}>
					{step.render(model.StepState.Steps[step.Index], triggerUpdate)}
				</Fragment>
			))}

			<h2>Character Data</h2>
			<DumpObject object={model?.Character} />

			<h2>Step State</h2>
			<DumpObject object={model?.StepState} />

			<h2>Source Data</h2>
			<DumpObject object={model?.SourceData} />

			{(
				(model?.SourceData as SourceData).IncantationSpells[1].Level ===
				SpellGrouping.Mid
			).toString()}
			{(
				(model?.SourceData as SourceData).IncantationSpells[1].Level ===
				SpellGrouping.Low
			).toString()}
		</div>
	);
}
