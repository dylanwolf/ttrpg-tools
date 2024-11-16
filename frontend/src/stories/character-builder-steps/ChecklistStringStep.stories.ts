import { StoryObj } from "@storybook/react/*";
import { createStepTesterArgs, renderStepTest } from "./StepTester";
import { fn } from "@storybook/test";
import { ChecklistStringStep } from "../../utilities/character-builder/steps/ChecklistStringStep";
import "../../App.scss";
import { NumericStep } from "../../utilities/character-builder/steps/NumericStep";

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
	name: "Basic Usage",
	args: {
		...createStepTesterArgs(
			{ Options: ["One", "Two", "Three", "Four"] },
			{ Values: ["One", "Three", "Five"] },
			[
				new ChecklistStringStep<any, any, any>("ChecklistStringTest")
					.withLabel("StringChecklist Test")
					.withSelectList((src, data) => src.Options)
					.withItemValue((itm) => itm)
					.withItemText((itm) => itm)
					.withDefaultValue((src, data, lst) => data.Values || [])
					.onCharacterUpdate(
						(src, state, newData) => (newData.Values = state.Values || [])
					),
			]
		),
	},
};

export const WithMarkdown: Story = {
	name: "With Markdown",
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
				new ChecklistStringStep<any, any, any>("ChecklistStringTest")
					.useMarkdown(true)
					.withLabel("StringChecklist Test")
					.withSelectList((src, data) => src.Options)
					.withItemText((itm) => itm.DisplayValue)
					.withItemValue((itm) => itm.Key)
					.withDefaultValue((src, data, lst) => data.Values || [])
					.onCharacterUpdate(
						(src, state, newData) => (newData.Values = state.Values || [])
					),
			]
		),
	},
};

export const DropdownForSingleChoice: Story = {
	name: "DropDown for Single Choice",
	args: {
		...createStepTesterArgs(
			{ Options: ["One", "Two", "Three", "Four"] },
			{ Values: ["One"], ChoiceCount: 2 },
			[
				new NumericStep<any, any>("NumberOfChoices")
					.withLabel("Number of Choices")
					.withDefaultValue((src, data) => data.ChoiceCount || 0)
					.onCharacterUpdate(
						(src, state, newData) => (newData.ChoiceCount = state.Value || 0)
					),
				new ChecklistStringStep<any, any, any>("ChecklistStringTest")
					.withLabel("StringChecklist Test")
					.withSelectList((src, data) => src.Options)
					.withItemText((itm) => itm)
					.withItemValue((itm) => itm)
					.withDefaultValue((src, data, lst) => data.Values || [])
					.onCharacterUpdate(
						(src, state, newData) => (newData.Values = state.Values || [])
					)
					.requiresMaximumSelections((src, data) => data.ChoiceCount)
					.useDropDownForSingleChoice(true),
			]
		),
	},
};
