import { Fragment } from "react";
import { ICharacterData } from "../utilities/character-builder/BuilderFactory";
import {
	StepModel,
	StepRunner,
} from "../utilities/character-builder/StepModel";
import { useArgs } from "storybook/internal/preview-api";

export function createStepTesterArgs(
	sourceData: any,
	character: any,
	steps: StepModel<any, any, any>[]
) {
	var runner = new StepRunner<any, any>("Test Runner", steps);
	var sourceData = sourceData;
	var character = character;
	var stepState = runner.initializeState();

	var stateUpdates = runner.onStepUpdated(sourceData, character, stepState, -1);

	return {
		SourceData: sourceData,
		Character: stateUpdates.NewCharacterData,
		StepRunnerState: stateUpdates.NewStepState,
		Runner: runner,
	};
}
interface StepTesterArgs {
	SourceData?: any;
	Character?: any;
	StepRunnerState?: any;
	Runner: StepRunner<any, any>;
	onUpdate: (data: any) => void;
}

export function renderStepTest(a: any) {
	const [args, setArgs, resetArgs] = useArgs<StepTesterArgs>();

	function onUpdate(index: number, stepUpdates?: any) {
		var stateUpdates = args.Runner.onStepUpdated(
			args.SourceData,
			args.Character,
			args.StepRunnerState,
			index,
			stepUpdates
		);

		setArgs({
			Character: stateUpdates.NewCharacterData,
			StepRunnerState: stateUpdates.NewStepState,
		});

		args.onUpdate(stateUpdates);
	}

	return (
		<>
			{args.Runner.ByIndex.map((s, idx) => (
				<Fragment key={`Step-${idx}`}>
					{s.render(args.StepRunnerState.Steps[idx], onUpdate)}
				</Fragment>
			))}
		</>
	);
}
