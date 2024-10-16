import { StoryObj } from "@storybook/react/*";
import { createStepTesterArgs, renderStepTest } from "./StepTester";
import { fn } from "@storybook/test";
import { StringDropDownStep } from "../../utilities/character-builder/steps/StringDropDownStep";
import { valueIfInList } from "../../helpers/builderHelpers";
import { registerArrayHelpers } from "../../helpers/arrayHelpers";

registerArrayHelpers();

const meta = {
	title: "Builder Steps - String Drop Down",
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
			{
				Options: [
					{ Value: "1", Text: "One" },
					{ Value: "2", Text: "Two" },
					{ Value: "3", Text: "Three" },
					{ Value: "4", Text: "Four" },
				],
			},
			{ SelectedValue: "3" },
			[
				new StringDropDownStep<any, any, any>(
					"StringDropDownStep",
					"String Drop Down Test",
					(src, data) => src.Options,
					(itm) => itm.Value,
					(itm) => itm.Text,
					(src, data, lst) => valueIfInList(data.SelectedValue, lst),
					(src, state, newData) => (newData.SelectedValue = state.Value)
				),
			]
		),
	},
};
