import { StoryObj } from "@storybook/react/*";
import { createStepTesterArgs, renderStepTest } from "./StepTester";
import { fn } from "@storybook/test";
import { AssignPoolStep } from "../../utilities/character-builder/steps/AssignPoolStep";

const meta = {
	title: "Builder Steps - Assign Pool",
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
			{},
			{
				PoolValues: {
					"Pool 1 (0-5)": 3,
					"Pool 2": 3,
					"Pool 3": 2,
					"Pool 4 (0-2)": 2,
				},
			},
			[
				new AssignPoolStep<any, any>("AssignPoolTest")
					.withLabel("Assignment Pool")
					.withAvailablePoints((src, data) => 10)
					.withStatPools((src, data) => [
						{ Name: "Pool 1 (0-5)", MaxValue: 5 },
						{ Name: "Pool 2" },
						{ Name: "Pool 3" },
						{ Name: "Pool 4 (0-2)", MaxValue: 2 },
					])
					.withDefaultValue((src, data) => {
						return data.PoolValues || {};
					})
					.onCharacterUpdate(
						(src, state, newData) => (newData.PoolValues = state.Values)
					),
			]
		),
	},
};

export const InvalidInitialValue: Story = {
	name: "Invalid Initial Value",
	args: {
		...createStepTesterArgs(
			{},
			{
				PoolValues: {
					"Pool 1 (0-5)": 6,
					"Pool 2": 10,
					"Pool 3": 0,
					"Pool 4 (0-2)": 0,
				},
			},
			[
				new AssignPoolStep<any, any>("AssignPoolTest")
					.withLabel("Assignment Pool")
					.withAvailablePoints((src, data) => 10)
					.withStatPools((src, data) => [
						{ Name: "Pool 1 (0-5)", MaxValue: 5 },
						{ Name: "Pool 2" },
						{ Name: "Pool 3" },
						{ Name: "Pool 4 (0-2)", MaxValue: 2 },
					])
					.withDefaultValue((src, data) => {
						return data.PoolValues || {};
					})
					.onCharacterUpdate(
						(src, state, newData) => (newData.PoolValues = state.Values)
					),
			]
		),
	},
};
