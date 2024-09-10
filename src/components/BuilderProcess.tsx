import { BusyIcon } from "./BusyIcon";
import { observer } from "mobx-react-lite";
import { CharacterViewModel } from "../models/CharacterViewModel";
import { Fragment } from "react/jsx-runtime";
import { CharacterSheet } from "./CharacterSheet";

export interface BuilderProcessProps {
	characterModel: CharacterViewModel;
}

export interface BuilderStepProps {
	stepIndex: number;
}

export const BuilderProcess = observer((props: BuilderProcessProps) => {
	return props.characterModel.Builder ? (
		<div style={{ display: "flex" }}>
			<div style={{ flex: "50%" }}>
				<BuilderProcessInternal characterModel={props.characterModel} />
			</div>
			<div style={{ flex: "50%", paddingLeft: "1em" }}>
				<CharacterSheet characterModel={props.characterModel} />
			</div>
		</div>
	) : (
		<div className="placeholder">
			<BusyIcon />
		</div>
	);
});

const BuilderProcessInternal = observer((props: BuilderProcessProps) => {
	return (
		<div>
			<div>{props.characterModel.Steps.CurrentStep}</div>
			<div>
				[
				{props.characterModel.Steps.ByIndex.map((s) =>
					s.isCompleted?.toString()
				).join(", ")}
				]
			</div>
			<div>
				[
				{props.characterModel.Steps.ByIndex.map((s) =>
					s.isVisible?.toString()
				).join(", ")}
				]
			</div>
			<div>
				{JSON.stringify(props.characterModel.getfirstClassExtraMasteredWeapons)}
			</div>
			{props.characterModel.Steps.ByIndex.filter((step) => step.isVisible).map(
				(step, stepIdx) => (
					<Fragment key={`Builder-Step${stepIdx}`}>
						<hr />
						<div>Step {stepIdx}</div>
						{step.render(props.characterModel, stepIdx)}
					</Fragment>
				)
			)}
		</div>
	);
});
