import { fn } from "@storybook/test";
import { StoryObj } from "@storybook/react/*";
import { NumericInput } from "../components/fields/NumericInput";

const meta = {
	title: "Components - Numeric Input",
	component: NumericInput,
	parameters: {
		layout: "centered",
	},
};

export default meta;
export type Story = StoryObj<typeof meta>;

export const BasicUsage: Story = {
	name: "Basic Usage",
	args: {
		InitialValue: 1,
		OnChange: fn(),
	},
};

export const MinMaxUsage: Story = {
	name: "Basic Min/Max",
	args: {
		InitialValue: 1,
		MinValue: 0,
		MaxValue: 5,
		OnChange: fn(),
	},
};
