import { BusyIcon } from "./BusyIcon";
import { observer } from "mobx-react-lite";
import { CharacterViewModel } from "../models/CharacterViewModel";
import { Fragment } from "react/jsx-runtime";

export interface BuilderProcessProps {
	characterModel: CharacterViewModel;
}

export interface BuilderStepProps {
	stepIndex: number;
}

export const BuilderProcess = observer((props: BuilderProcessProps) => {
	return props.characterModel.Builder ? (
		<BuilderProcessInternal characterModel={props.characterModel} />
	) : (
		<div className="placeholder">
			<BusyIcon />
		</div>
	);
});

function BuilderProcessInternal(props: BuilderProcessProps) {
	return (
		<div>
			<div>{props.characterModel.Steps.CurrentStep}</div>
			<div>{props.characterModel.Steps.ByIndex[0].isCompleted?.toString()}</div>
			{props.characterModel.Steps.ByIndex.filter(
				(step, stepIdx) => stepIdx <= props.characterModel.Steps.CurrentStep
			).map((step, stepIdx) => (
				<Fragment key={`Builder-Step${stepIdx}`}>
					{step.render(props.characterModel, stepIdx)}
				</Fragment>
			))}
		</div>
	);
}
