import { StoryObj } from "@storybook/react/*";
import { createStepTesterArgs, renderStepTest } from "./StepTester";
import { fn } from "@storybook/test";
import { ChecklistStringStep } from "../utilities/character-builder/steps/ChecklistStringStep";
import "../App.scss";

const meta = {
	title: "Builder Steps - String Checklist",
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
		...createStepTesterArgs(
			{ Options: ["One", "Two", "Three", "Four"] },
			{ Values: ["One", "Three", "Five"] },
			[
				new ChecklistStringStep<any, any, any>(
					"ChecklistStringTest",
					"StringChecklist Test",
					(src, data) => src.Options,
					(itm) => itm,
					(itm) => itm,
					(src, data, lst) => data.Values || [],
					(src, state, newData) => (newData.Values = state.Values || [])
				),
			]
		),
	},
};

export const WithMarkdown: Story = {
	storyName: "With Markdown",
	args: {
		...createStepTesterArgs(
			{
				Options: [
					{ Key: "Bold", DisplayValue: "**Bold**" },
					{ Key: "Italic", DisplayValue: "*Italic*" },
					{ Key: "Underline", DisplayValue: "__Underline__" },
				],
			},
			{ Values: ["Italic", "Plain Text"] },
			[
				new ChecklistStringStep<any, any, any>(
					"ChecklistStringTest",
					"StringChecklist Test",
					(src, data) => src.Options,
					(itm) => itm.Key,
					(itm) => itm.DisplayValue,
					(src, data, lst) => data.Values || [],
					(src, state, newData) => (newData.Values = state.Values || [])
				).useMarkdown(true),
			]
		),
	},
};
