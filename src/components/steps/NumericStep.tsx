import { StepModel, StepState } from "../../models/StepModel";

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
	GetMinValue: (src: TSource, data: TData) => number | undefined;
	GetMaxValue: (src: TSource, data: TData) => number | undefined;
	GetNumericStep: (src: TSource, data: TData) => number | undefined;
	GetDefaultValue: (src: TSource, data: TData) => number | undefined;
	GetIsVisible: ((src: TSource, data: TData) => boolean) | undefined;

	constructor(
		name: string,
		label: string,
		getMinValue: (src: TSource, data: TData) => number | undefined,
		getMaxValue: (src: TSource, data: TData) => number | undefined,
		getNumericStep: (src: TSource, data: TData) => number | undefined,
		getDefaultValue: (src: TSource, data: TData) => number | undefined,
		updateCharacter: (
			source: TSource,
			state: NumericStepState,
			newData: TData
		) => void,
		getIsVisible?: ((src: TSource, data: TData) => boolean) | undefined
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.GetMinValue = getMinValue;
		this.GetMaxValue = getMaxValue;
		this.GetNumericStep = getNumericStep;
		this.GetDefaultValue = getDefaultValue;
		this.GetIsVisible = getIsVisible;
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

	updateState(source: TSource, data: TData, newState: NumericStepState): void {
		newState.IsVisible = this.GetIsVisible
			? this.GetIsVisible(source, data)
			: true;

		if (!newState.IsVisible) {
			this.clearState(newState);
			newState.IsCompleted = true;
		} else {
			newState.MinValue = this.GetMinValue(source, data);
			newState.MaxValue = this.GetMaxValue(source, data);
			newState.NumericStep = this.GetNumericStep(source, data) || 1;

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
	render(
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
			<div
				className={`step step-numeric step-${this.Name} step-${
					stepState.IsCompleted ? "complete" : "incomplete"
				}`}
			>
				<label>
					{this.Label ? `${this.Label}:` : ""}
					<input
						type="number"
						value={stepState.Value !== null ? stepState.Value : ""}
						min={stepState.MinValue}
						max={stepState.MaxValue}
						step={stepState.NumericStep}
						onChange={onChange}
					/>
				</label>
			</div>
		);
	}
}
