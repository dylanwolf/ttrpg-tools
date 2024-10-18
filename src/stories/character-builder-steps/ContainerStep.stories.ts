import { StoryObj } from "@storybook/react/*";
import { createStepTesterArgs, renderStepTest } from "./StepTester";
import { fn } from "@storybook/test";
import { StringDropDownStep } from "../../utilities/character-builder/steps/StringDropDownStep";
import { ContainerStep } from "../../utilities/character-builder/steps/ContainerStep";
import { valueIfInList } from "../../helpers/builderHelpers";
import { registerArrayHelpers } from "../../helpers/arrayHelpers";

registerArrayHelpers();

const meta = {
	title: "Builder Steps - Container",
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
				Options: ["one", "two", "three", "four", "five", "six", "seven"],
			},
			{ ShowContainer: false, Item1: "", Item2: "", Item3: "" },
			[
				new StringDropDownStep<any, any, any>(
					"ShowContainerStep",
					"Show Container?",
					(src, data) => ["Yes", "No"],
					(itm) => itm,
					(itm) => itm,
					(src, data) => (data.ShowContainer ? "Yes" : "No"),
					(src, state, newData) =>
						(newData.ShowContainer = state.Value === "Yes")
				),
				new ContainerStep<any, any>("ContainerTest", "Test Container", [
					new StringDropDownStep<any, any, any>(
						"DropDownStep1",
						"Item 1",
						(src, data) => src.Options,
						(itm) => itm,
						(itm) => itm,
						(src, data, lst) => valueIfInList(data.Item1, lst),
						(src, state, newData) => (newData.Item1 = state.Value || "")
					),
					new StringDropDownStep<any, any, any>(
						"DropDownStep2",
						"Item 2",
						(src, data) =>
							src.Options.filter((x: any) => ![data.Item1].includes(x)),
						(itm) => itm,
						(itm) => itm,
						(src, data, lst) => valueIfInList(data.Item2, lst),
						(src, state, newData) => (newData.Item2 = state.Value || "")
					),
					new StringDropDownStep<any, any, any>(
						"DropDownStep3",
						"Item 3",
						(src, data) =>
							src.Options.filter(
								(x: any) => ![data.Item1, data.Item2].includes(x)
							),
						(itm) => itm,
						(itm) => itm,
						(src, data, lst) => valueIfInList(data.Item3, lst),
						(src, state, newData) => (newData.Item3 = state.Value || "")
					),
				]).onlyShowWhen((src, data) => data.ShowContainer),
			]
		),
	},
};