import { StoryObj } from "@storybook/react/*";
import { createStepTesterArgs, renderStepTest } from "./StepTester";
import { fn } from "@storybook/test";
import { AssignStatsStep } from "../../utilities/character-builder/steps/AssignStatsStep";

const meta = {
	title: "Builder Steps - Assign Stats",
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
				Dice: [
					{ Value: 4 },
					{ Value: 6 },
					{ Value: 8 },
					{ Value: 10 },
					{ Value: 12 },
					{ Value: 20 },
				],
			},
			{
				Attributes: {
					"Attribute 1": 6,
					"INVALID 1": 10,
					"Attribute 3": 4,
					"Attribute 4": 20,
					"INVALID 2": 8,
					"Attribute 5": 12,
				},
			},
			[
				new AssignStatsStep<any, any, any>("AssignStatsTest")
					.withLabel("Assign Stats")
					.withChoicesList((src, data) => src.Dice)
					.withChoiceEqualsFunction((us, them) => us.Value === them.Value)
					.withChoiceText((itm) => `d${itm.Value}`)
					.withStatTargets((source, data) => [
						{ Name: "Attribute 1" },
						{ Name: "Attribute 2" },
						{ Name: "Attribute 3" },
						{ Name: "Attribute 4" },
						{ Name: "Attribute 5" },
						{ Name: "Attribute 6" },
					])
					.withDefaultValue((src, data, lst) => {
						if (data.Attributes) {
							var stateValue: { [name: string]: any } = {};
							Object.keys(data.Attributes).forEach((key) => {
								stateValue[key] = { Value: data.Attributes[key] };
							});
							return stateValue;
						}
						return {};
					})
					.onCharacterUpdate((src, state, newData) => {
						var newValue: { [name: string]: number } = {};

						if (state.Value) {
							Object.keys(state.Value).forEach((key) => {
								if (state.Value && state.Value[key]) {
									newValue[key] = state.Value[key].Value;
								}
							});
						}

						newData.Attributes = newValue;
					}),
			]
		),
	},
};

export const LockedStats: Story = {
	name: "Locked Stats",
	args: {
		...createStepTesterArgs(
			{
				Dice: [
					{ Value: 4, Locked: "Attribute 3" },
					{ Value: 6, Locked: "Attribute 1" },
					{ Value: 8 },
					{ Value: 10 },
					{ Value: 12 },
					{ Value: 20, Locked: "Attribute 4" },
				],
			},
			{
				Attributes: {},
			},
			[
				new AssignStatsStep<any, any, any>("AssignStatsTest")
					.withLabel("Assign Stats")
					.withChoicesList((src, data) => src.Dice)
					.withChoiceEqualsFunction((us, them) => us.Value === them.Value)
					.withChoiceText((itm) => `d${itm.Value}`)
					.withStatTargets((source, data) =>
						[
							"Attribute 1",
							"Attribute 2",
							"Attribute 3",
							"Attribute 4",
							"Attribute 5",
							"Attribute 6",
						].map((attr) => {
							var match = source.Dice.filter((x: any) => x.Locked === attr)[0];

							return {
								Name: attr,
								Locked: match ? true : false,
								FixedValue: match,
							};
						})
					)
					.withDefaultValue((src, data, lst) => {
						if (data.Attributes) {
							var stateValue: { [name: string]: any } = {};
							Object.keys(data.Attributes).forEach((key) => {
								stateValue[key] = { Value: data.Attributes[key] };
							});
							return stateValue;
						}
						return {};
					})
					.onCharacterUpdate((src, state, newData) => {
						var newValue: { [name: string]: number } = {};

						if (state.Value) {
							Object.keys(state.Value).forEach((key) => {
								if (state.Value && state.Value[key]) {
									newValue[key] = state.Value[key].Value;
								}
							});
						}

						newData.Attributes = newValue;
					}),
			]
		),
	},
};
