import { NumericInput } from "../../../components/fields/NumericInput";
import { ICharacterData } from "../BuilderFactory";
import { StepModel, StepState } from "../StepModel";

// TODO: [Numeric Input] Allow for min values > 0 (e.g., if min value is 5, let the user type "10")

/**
 * Tracks the state of a NumericStep
 */
interface NumericStepState extends StepState {
	/**
	 * The minimum allowed value. The step will not generally allow lower numbers to be entered if this is provided; if one is, the step will be marked incomplete.
	 */
	MinValue?: number | undefined;
	/**
	 * The maximum allowed value. The step will not generally allow higher numbers to be entered if this is provided; if one is, the step will be marked incomplete.
	 */
	MaxValue?: number | undefined;
	/**
	 * The step value for the HTML numeric input control.
	 */
	NumericStep?: number | undefined;
	/**
	 * The current value of the step.
	 */
	Value?: number | null | undefined;
}

/**
 * Defines a step used to enter a single whole number.
 */
export class NumericStep<
	TSource,
	TData extends ICharacterData
> extends StepModel<TSource, TData, NumericStepState> {
	Label: string | undefined;
	GetMinValue: ((src: TSource, data: TData) => number | undefined) | undefined;
	GetMaxValue: ((src: TSource, data: TData) => number | undefined) | undefined;
	GetStepValue: ((src: TSource, data: TData) => number | undefined) | undefined;
	GetDefaultValue:
		| ((src: TSource, data: TData) => number | undefined)
		| undefined;
	ClampInputField: boolean | undefined;

	constructor(name: string) {
		super(name);
	}

	/**
	 * Sets the label that will be shown on this step.
	 * @param label
	 * @returns
	 */
	withLabel(label: string | undefined) {
		this.Label = label;
		return this;
	}

	/**
	 * Defines a function used to set the value when the step loads. This function should load data from existing character data if availble, or supply a value for new characters.
	 * @param defaultValueFunc
	 * @returns
	 */
	withDefaultValue(
		defaultValueFunc: (src: TSource, data: TData) => number | undefined
	) {
		this.GetDefaultValue = defaultValueFunc;
		return this;
	}

	controlTypeId(): string {
		return "numeric";
	}

	withMinValue(
		getMinValue: ((src: TSource, data: TData) => number | undefined) | undefined
	) {
		this.GetMinValue = getMinValue;
		return this;
	}

	withMaxValue(
		getMaxValue: ((src: TSource, data: TData) => number | undefined) | undefined
	) {
		this.GetMaxValue = getMaxValue;
		return this;
	}

	clampInputField(flag: boolean) {
		this.ClampInputField = flag;
		return this;
	}

	withStepValue(
		getNumericStep:
			| ((src: TSource, data: TData) => number | undefined)
			| undefined
	) {
		this.GetStepValue = getNumericStep;
		return this;
	}

	initializeState(): NumericStepState {
		return {
			IsCompleted: false,
			IsVisible: this.GetIsVisible ? false : true,
		};
	}

	clearState(newState: NumericStepState) {
		newState.Value = undefined;
	}

	updateStateInternal(
		source: TSource,
		data: TData,
		newState: NumericStepState
	): void {
		if (!newState.IsVisible) {
			this.clearState(newState);
			newState.IsCompleted = true;
		} else {
			newState.MinValue = this.GetMinValue
				? this.GetMinValue(source, data)
				: undefined;
			newState.MaxValue = this.GetMaxValue
				? this.GetMaxValue(source, data)
				: undefined;
			newState.NumericStep = this.GetStepValue
				? this.GetStepValue(source, data)
				: 1;

			if (newState.Value === undefined)
				newState.Value =
					(this.GetDefaultValue && this.GetDefaultValue(source, data)) ||
					undefined;
			if (newState.Value !== undefined && newState.Value !== null) {
				if (
					newState.MinValue !== undefined &&
					newState.Value < newState.MinValue
				)
					newState.Value = newState.MinValue;
				if (
					newState.MaxValue !== undefined &&
					newState.Value > newState.MaxValue
				)
					newState.Value = newState.MaxValue;
			}

			newState.IsCompleted = newState.Value !== undefined;
		}
	}
	renderInternal(
		stepState: NumericStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var index = this.Index;

		// function onChange(evt: React.ChangeEvent<HTMLInputElement>) {
		// 	var fieldValue = getNumericFieldValueFrom(evt);
		// 	if (fieldValue === undefined) {
		// 		triggerUpdate(index, { Value: null });
		// 	} else if (fieldValue !== undefined) {
		// 		triggerUpdate(index, { Value: fieldValue });
		// 	}
		// }

		function onChange(fieldValue: number | undefined) {
			if (fieldValue === undefined) {
				triggerUpdate(index, { Value: null });
			} else if (fieldValue !== undefined) {
				triggerUpdate(index, { Value: fieldValue });
			}
		}

		return (
			<>
				<label>
					{this.Label ? `${this.Label}: ` : ""}
					<NumericInput
						InitialValue={stepState.Value}
						MinValue={stepState.MinValue}
						MaxValue={stepState.MaxValue}
						NumericStep={stepState.NumericStep}
						ClampInput={this.ClampInputField}
						OnChange={onChange}
					/>
				</label>
			</>
		);
	}
}
