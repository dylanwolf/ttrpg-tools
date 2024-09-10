import { action, computed, makeObservable, observable } from "mobx";
import { StepControlProps, StepModel } from "../../models/StepModel";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export class NumericStepModel<TModel> extends StepModel<TModel> {
	@observable Value: number | undefined;
	@observable Label: string;

	@observable MinValue: number | undefined;
	@observable MaxValue: number | undefined;
	@observable NumericStep: number | undefined;

	_minValueFunc: ((model: TModel) => number) | undefined;
	_maxValueFunc: ((model: TModel) => number) | undefined;
	_stepValueFunc: ((model: TModel) => number) | undefined;
	_defaultValueFunc: (model: TModel) => number;

	constructor(
		name: string,
		label: string,
		defaultValueFunc: (model: TModel) => number,
		minValueFunc?: ((model: TModel) => number) | undefined,
		maxValueFunc?: ((model: TModel) => number) | undefined,
		stepValueFunc?: ((model: TModel) => number) | undefined
	) {
		super(name);
		this.Label = label;
		this._defaultValueFunc = defaultValueFunc;
		this._minValueFunc = minValueFunc;
		this._maxValueFunc = maxValueFunc;
		this._stepValueFunc = stepValueFunc;

		makeObservable(this);
	}

	@action.bound setValue(value: number) {
		var hasChanged = this.Value !== value;
		this.Value = value;
		if (hasChanged) {
			this.Container?.onStepProgression(this.Container.ByIndex.indexOf(this));
		}
	}

	@computed get isCompleted(): boolean {
		return this.Value !== undefined;
	}

	@action.bound refresh(model: TModel, refreshingSelf: boolean): void {
		if (refreshingSelf) return;

		this.MinValue = this._minValueFunc ? this._minValueFunc(model) : undefined;
		this.MaxValue = this._maxValueFunc ? this._maxValueFunc(model) : undefined;
		this.NumericStep = this._stepValueFunc ? this._stepValueFunc(model) : 1;

		if (this.Value === undefined) this.setValue(this._defaultValueFunc(model));
	}
	@action.bound completed(model: TModel): void {}

	render(model: TModel, stepIdx: number): JSX.Element {
		return <NumericStepControl model={model} step={this} stepIndex={stepIdx} />;
	}
}

const NumericStepControl = observer(
	<TModel,>(props: StepControlProps<TModel, NumericStepModel<TModel>>) => {
		const [selectedValue, setSelectedValue] = useState<number>(
			props.step.Value || 0
		);

		function onChange(evt: React.ChangeEvent<HTMLInputElement>) {
			var field = evt.currentTarget;
			var newValue = parseInt(field.value);

			setSelectedValue(newValue);
			props.step.setValue(newValue);
		}

		return (
			<div className={`step step-numeric step-${props.step.Name}`}>
				<label>
					{props.step.Label}:
					<input
						type="number"
						value={selectedValue}
						min={props.step.MinValue}
						max={props.step.MaxValue}
						step={props.step.NumericStep}
						onChange={onChange}
					/>
				</label>
			</div>
		);
	}
);
