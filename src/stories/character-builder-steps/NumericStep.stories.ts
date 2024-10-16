import { StoryObj } from "@storybook/react/*";
import { createStepTesterArgs, renderStepTest } from "./StepTester";
import { fn } from "@storybook/test";
import { NumericStep } from "../../utilities/character-builder/steps/NumericStep";

const meta = {
	title: "Builder Steps - Numeric Entry",
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
		...createStepTesterArgs({}, { Number: 1 }, [
			new NumericStep<any, any>(
				"NumericStep",
				"Numeric Test",
				(src, data) => data.Number || undefined,
				(src, state, newData) => (newData.Number = state.Value)
			),
		]),
	},
};

export const WithMinValue: Story = {
	name: "With Minimum Value",
	args: {
		...createStepTesterArgs({}, { Number: 1 }, [
			new NumericStep<any, any>(
				"NumericStep",
				"Minimum 5",
				(src, data) => data.Number || undefined,
				(src, state, newData) => (newData.Number = state.Value)
			).withMinValue(() => 5),
		]),
	},
};

export const WithMaxValue: Story = {
	name: "With Maximum Value",
	args: {
		...createStepTesterArgs({}, { Number: 10 }, [
			new NumericStep<any, any>(
				"NumericStep",
				"Maximum 5",
				(src, data) => data.Number || undefined,
				(src, state, newData) => (newData.Number = state.Value)
			).withMaxValue(() => 5),
		]),
	},
};

export const WithStepValue: Story = {
	name: "With Step Value",
	args: {
		...createStepTesterArgs({}, { Number: 0 }, [
			new NumericStep<any, any>(
				"NumericStep",
				"Step 2",
				(src, data) => data.Number || undefined,
				(src, state, newData) => (newData.Number = state.Value)
			).withStepValue(() => 2),
		]),
	},
};
