import { StoryObj } from "@storybook/react/*";
import {
	createDefaultStepTesterArgs,
	renderStepTest,
	TestCharacter,
	TestSource,
} from "./StepTester";
import { StaticTextStep } from "../utilities/character-builder/steps/StaticTextStep";

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

export const BasicUsage: Story = {
	storyName: "Plain Text",
	args: {
		...createDefaultStepTesterArgs([
			new StaticTextStep<TestSource, TestCharacter>(
				"StringEntryTest",
				"String Entry Test",
				false,
				(src, data) => src.__NAME__ || "",
				(src, state, newData) => (newData.Title = state.Value || "")
			),
		]),
	},
};

export const MarkdownUsage: Story = {
	storyName: "Markdown",
	args: {
		...createDefaultStepTesterArgs([
			new StaticTextStep<TestSource, TestCharacter>(
				"StringEntryTest",
				"String Entry Test",
				true,
				(src, data) => src.MarkdownValue || "",
				(src, state, newData) => (newData.Title = state.Value || "")
			),
		]),
	},
};
