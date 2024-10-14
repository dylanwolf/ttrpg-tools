import { Fragment } from "react";
import { ICharacterData } from "../utilities/character-builder/BuilderFactory";
import {
	StepModel,
	StepRunner,
} from "../utilities/character-builder/StepModel";
import { useArgs } from "storybook/internal/preview-api";
import { fn } from "@storybook/test";

export interface TestSource {
	__NAME__: string;
	MarkdownValue: string;
}

export interface TestCharacter extends ICharacterData {
	SimpleTextValue: string;
}

function createDefaultTestSource(): TestSource {
	return {
		__NAME__: "Test Source Data",
		MarkdownValue: "This *value* contains **Markdown**.",
	};
}

function createDefaultTestCharacter(): TestCharacter {
	return {
		Title: "",
		SimpleTextValue: "Initial value.",
	};
}

export function createDefaultStepTesterArgs(
	steps: StepModel<TestSource, TestCharacter, any>[]
): StepTesterArgs {
	var runner = new StepRunner<any, any>("Test Runner", steps);
	var sourceData = createDefaultTestSource();
	var character = createDefaultTestCharacter();
	var stepState = runner.initializeState();

	var stateUpdates = runner.onStepUpdated(sourceData, character, stepState, -1);

	return {
		SourceData: sourceData,
		Character: stateUpdates.NewCharacterData,
		StepRunnerState: stateUpdates.NewStepState,
		Runner: runner,
		onUpdate: fn(),
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
