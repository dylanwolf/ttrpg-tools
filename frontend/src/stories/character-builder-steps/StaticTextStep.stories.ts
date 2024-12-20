import { StoryObj } from "@storybook/react/*";
import { createStepTesterArgs, renderStepTest } from "./StepTester";
import { StaticTextStep } from "../../utilities/character-builder/steps/StaticTextStep";

const meta = {
	title: "Builder Steps - Static Text",
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

export const PlainText: Story = {
	name: "Plain Text",
	args: {
		...createStepTesterArgs(
			{ StringSource: "Test plain text value" },
			{ StringOutput: "" },
			[
				new StaticTextStep<any, any>(
					"StringEntryTest",
					(src, data) => src.StringSource || ""
				)
					.withLabel("String Entry Test")
					.onCharacterUpdate(
						(src, state, newData) => (newData.StringOutput = state.Value || "")
					),
			]
		),
	},
};

export const Markdown: Story = {
	name: "Plain Text",
	args: {
		...createStepTesterArgs(
			{ StringSource: "This *value* contains **Markdown**" },
			{ StringOutput: "" },
			[
				new StaticTextStep<any, any>(
					"StringEntryTest",
					(src, data) => src.StringSource || ""
				)
					.withLabel("String Entry Test")
					.onCharacterUpdate(
						(src, state, newData) => (newData.StringOutput = state.Value || "")
					),
			]
		),
	},
};
