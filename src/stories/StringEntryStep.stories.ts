import { StoryObj } from "@storybook/react/*";
import { StringEntryStep } from "../utilities/character-builder/steps/StringEntryStep";
import { createStepTesterArgs, renderStepTest } from "./StepTester";
import { fn } from "@storybook/test";

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
	args: {
		onUpdate: fn(),
	},
};

export default meta;
export type Story = StoryObj<typeof meta>;

export const BasicUsage: Story = {
	storyName: "Basic Usage",
	args: {
		...createStepTesterArgs({}, { SimpleTextValue: "Initial value" }, [
			new StringEntryStep<any, any>(
				"StringEntryTest",
				"String Entry Test",
				(src, data) => data.SimpleTextValue || "",
				(src, state, newData) => (newData.SimpleTextValue = state.Value || "")
			),
		]),
	},
};
