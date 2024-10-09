import { StepModel, StepState } from "../../state/character-builder/StepModel";

interface NumericStepState extends StepState {
	MinValue?: number | undefined;
	MaxValue?: number | undefined;
	NumericStep?: number | undefined;
	Value?: number | null | undefined;
}

export class NumericStep<TSource, TData> extends StepModel<
	TSource,
	TData,
	NumericStepState
> {
	Label: string;
	GetMinValue: ((src: TSource, data: TData) => number | undefined) | undefined;
	GetMaxValue: ((src: TSource, data: TData) => number | undefined) | undefined;
	GetStepValue: ((src: TSource, data: TData) => number | undefined) | undefined;
	GetDefaultValue: (src: TSource, data: TData) => number | undefined;

	constructor(
		name: string,
		label: string,
		getDefaultValue: (src: TSource, data: TData) => number | undefined,
		updateCharacter: (
			source: TSource,
			state: NumericStepState,
			newData: TData
		) => void
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.GetDefaultValue = getDefaultValue;
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
				newState.Value = this.GetDefaultValue(source, data);
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

		function onChange(evt: React.ChangeEvent<HTMLInputElement>) {
			var field = evt.currentTarget;
			if (field.value.trim() === "") {
				triggerUpdate(index, { Value: null });
			} else {
				var newValue = parseInt(field.value);

				if (newValue !== undefined && !isNaN(newValue)) {
					triggerUpdate(index, { Value: newValue });
				} else {
					evt.preventDefault();
				}
			}
		}

		return (
			<>
				<label>
					{this.Label ? `${this.Label}: ` : ""}
					<input
						type="number"
						value={stepState.Value !== null ? stepState.Value : ""}
						min={stepState.MinValue}
						max={stepState.MaxValue}
						step={stepState.NumericStep}
						onChange={onChange}
					/>
				</label>
			</>
		);
	}
}
