import { StoryObj } from "@storybook/react/*";
import { createStepTesterArgs, renderStepTest } from "./StepTester";
import { fn } from "@storybook/test";
import { StringDropDownStep } from "../../utilities/character-builder/steps/StringDropDownStep";
import { valueIfInList } from "../../helpers/builderHelpers";
import { registerArrayHelpers } from "../../helpers/arrayHelpers";
import { NumericStep } from "../../utilities/character-builder/steps/NumericStep";
import { ForEachStep } from "../../utilities/character-builder/steps/ForEachStep";

registerArrayHelpers();

const meta = {
	title: "Builder Steps - ForEach Step",
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

function filterOptions(
	selectList: string[],
	iterationData: any[],
	index: number,
	currentData: string[]
) {
	var previousData = (index > 0 ? iterationData.slice(0, index) : [])
		.map((x) => [x.Item1, x.Item2, x.Item3])
		.flat()
		.concat(currentData);

	return selectList.filter((x) => !previousData.includes(x));
}

export const BasicUsage: Story = {
	name: "Basic Usage",
	args: {
		...createStepTesterArgs(
			{
				Options: [
					"one",
					"two",
					"three",
					"four",
					"five",
					"six",
					"seven",
					"eight",
					"nine",
					"ten",
					"eleven",
					"twelve",
				],
			},
			{ ForEachCount: 3, ForEachData: [] },
			[
				new NumericStep<any, any>(
					"CountStep",
					"# of Iterations",
					(src, data) =>
						data.ForEachCount !== undefined ? data.ForEachCount : 1,
					(src, state, newData) => (newData.ForEachCount = state.Value || 0)
				).withMinValue(() => 0),
				new ForEachStep<any, any, any>(
					"ForEachTest",
					(data, idx) => `Iteration #${idx + 1}`,
					(src, data) => data.ForEachCount,
					(data) => data.ForEachData,
					(data, newValue) => (data.ForEachData = newValue),
					(source, data, idx) => {
						return { Item1: "", Item2: "", Item3: "" };
					},
					[
						new StringDropDownStep<any, any, any>(
							"DropDownStep1",
							"Item 1",
							(src, data) => {
								return filterOptions(
									src.Options,
									data.ParentData.ForEachData,
									data.Index,
									[]
								);
							},
							(itm) => itm,
							(itm) => itm,
							(src, data, lst) => valueIfInList(data.IterationData.Item1, lst),
							(src, state, newData) =>
								(newData.IterationData.Item1 = state.Value || "")
						),
						new StringDropDownStep<any, any, any>(
							"DropDownStep2",
							"Item 2",
							(src, data) =>
								filterOptions(
									src.Options,
									data.ParentData.ForEachData,
									data.Index,
									[data.IterationData.Item1]
								),
							(itm) => itm,
							(itm) => itm,
							(src, data, lst) => valueIfInList(data.IterationData.Item2, lst),
							(src, state, newData) =>
								(newData.IterationData.Item2 = state.Value || "")
						),
						new StringDropDownStep<any, any, any>(
							"DropDownStep3",
							"Item 3",
							(src, data) =>
								filterOptions(
									src.Options,
									data.ParentData.ForEachData,
									data.Index,
									[data.IterationData.Item1, data.IterationData.Item2]
								),
							(itm) => itm,
							(itm) => itm,
							(src, data, lst) => valueIfInList(data.IterationData.Item3, lst),
							(src, state, newData) =>
								(newData.IterationData.Item3 = state.Value || "")
						),
					]
				),
			]
		),
	},
};
