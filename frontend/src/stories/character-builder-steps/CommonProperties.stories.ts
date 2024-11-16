import { StoryObj } from "@storybook/react/*";
import { createStepTesterArgs, renderStepTest } from "./StepTester";
import { fn } from "@storybook/test";
import { StringDropDownStep } from "../../utilities/character-builder/steps/StringDropDownStep";
import { valueIfInList } from "../../helpers/builderHelpers";
import { registerArrayHelpers } from "../../helpers/arrayHelpers";
import { StringEntryStep } from "../../utilities/character-builder/steps/StringEntryStep";
import "../../App.scss";
import "../../utilities/character-builder/components/CharacterBuilderProcess.css";

registerArrayHelpers();

const meta = {
	title: "Builder Steps - Common Step Properties",
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

export const IsVisibleFalse: Story = {
	name: "IsVisible = false",
	args: {
		...createStepTesterArgs(
			{
				Options: ["one", "two", "three", "four", "five", "six", "seven"],
			},
			{ ShowOption: false, Item1: "" },
			[
				new StringDropDownStep<any, any, any>("ShowOptionStep")
					.withLabel("Show Option?")
					.withSelectList((src, data) => ["Yes", "No"])
					.withItemText((itm) => itm)
					.withItemValue((itm) => itm)
					.withDefaultValue((src, data) => (data.ShowOption ? "Yes" : "No"))
					.onCharacterUpdate(
						(src, state, newData) =>
							(newData.ShowOption = state.Value === "Yes")
					),
				new StringDropDownStep<any, any, any>("DropDownStep1")
					.withLabel("Item 1")
					.withSelectList((src, data) => src.Options)
					.withItemText((itm) => itm)
					.withItemValue((itm) => itm)
					.withDefaultValue((src, data, lst) => valueIfInList(data.Item1, lst))
					.onCharacterUpdate(
						(src, state, newData) => (newData.Item1 = state.Value || "")
					)
					.onlyShowWhen((src, data) => data.ShowOption),
			]
		),
	},
};

export const IsRequired: Story = {
	name: "IsRequired = true",
	args: {
		...createStepTesterArgs(
			{},
			{
				Show3rdOption: false,
				Item1: "",
				Item2: "",
				Item3: "",
				SelectedValue: undefined,
			},
			[
				new StringDropDownStep<any, any, any>("Show3rdOptionStep")
					.withLabel("Show 3rd Option?")
					.withSelectList((src, data) => ["Yes", "No"])
					.withItemText((itm) => itm)
					.withItemValue((itm) => itm)
					.withDefaultValue((src, data) => (data.Show3rdOption ? "Yes" : "No"))
					.onCharacterUpdate(
						(src, state, newData) =>
							(newData.Show3rdOption = state.Value === "Yes")
					),
				new StringEntryStep<any, any>("OptionStep1")
					.withLabel("Option 1")
					.withDefaultValue((src, data) => data.Item1 || "")
					.onCharacterUpdate(
						(src, state, newData) => (newData.Item1 = state.Value)
					)
					.isRequired(),
				new StringEntryStep<any, any>("OptionStep2")
					.withLabel("Option 2")
					.withDefaultValue((src, data) => data.Item2 || "")
					.onCharacterUpdate(
						(src, state, newData) => (newData.Item2 = state.Value)
					)
					.isRequired(),
				new StringEntryStep<any, any>("OptionStep3")
					.withLabel("Option 3")
					.withDefaultValue((src, data) => data.Item3 || "")
					.onCharacterUpdate(
						(src, state, newData) => (newData.Item3 = state.Value)
					)
					.isRequired()
					.onlyShowWhen((src, data) => data.Show3rdOption),
				new StringDropDownStep<any, any, any>("SelectOptionStep")
					.withLabel("Select Option")
					.withSelectList((src, data) => {
						console.log([data.Item1, data.Item2, data.Item3]);
						console.log([data.Item1, data.Item2, data.Item3].filter((x) => x));
						return [data.Item1, data.Item2, data.Item3].filter((x) => x) || [];
					})
					.withItemText((itm) => itm)
					.withItemValue((itm) => itm)
					.withDefaultValue((src, data, lst) =>
						valueIfInList(data.SelectedValue, lst)
					)
					.onCharacterUpdate(
						(src, state, newData) => (newData.SelectedValue = state.Value)
					),
			]
		),
	},
};

export const WithHelp: Story = {
	name: "With Help",
	args: {
		...createStepTesterArgs(
			{
				Options: ["one", "two", "three", "four", "five", "six", "seven"],
			},
			{ ShowOption: false, Item1: "" },
			[
				new StringDropDownStep<any, any, any>("DropDownStep1")
					.withLabel("Item 1")
					.withSelectList((src, data) => src.Options)
					.withItemText((itm) => itm)
					.withItemValue((itm) => itm)
					.withDefaultValue((src, data, lst) => valueIfInList(data.Item1, lst))
					.onCharacterUpdate(
						(src, state, newData) => (newData.Item1 = state.Value || "")
					)
					.withHelp("Here is a help message"),
			]
		),
	},
};
