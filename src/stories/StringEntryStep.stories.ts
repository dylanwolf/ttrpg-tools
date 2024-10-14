import { StoryObj } from "@storybook/react/*";
import { StringEntryStep } from "../utilities/character-builder/steps/StringEntryStep";
import {
	createDefaultStepTesterArgs,
	renderStepTest,
	TestCharacter,
	TestSource,
} from "./StepTester";

const meta = {
	title: "Builder Steps - String Entry",
	render: renderStepTest,
	argTypes: {
		SourceData: { type: "any" },
		Character: { type: "any" },
		StepRunnerState: { type: "any" },
		Runner: { type: "StepRunner<any, any>" },
	},
	parameters: {
		layout: "centered",
	},
};

export default meta;
export type Story = StoryObj<typeof meta>;

export const BasicUsage: Story = {
	storyName: "Basic Usage",
	args: {
		...createDefaultStepTesterArgs([
			new StringEntryStep<TestSource, TestCharacter>(
				"StringEntryTest",
				"String Entry Test",
				(src, data) => data.SimpleTextValue || "",
				(src, state, newData) => (newData.SimpleTextValue = state.Value || "")
			),
		]),
	},
};
