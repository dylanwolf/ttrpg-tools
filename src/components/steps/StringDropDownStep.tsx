import { action, computed, makeObservable, observable } from "mobx";
import { StepControlProps, StepModel } from "../../models/StepModel";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export class StringDropDownStepModel<TModel, TItem> extends StepModel<TModel> {
	@observable Value: string | undefined;
	@observable.shallow SelectList: TItem[];
	@observable Label: string;
	_selectListFunc: (model: TModel) => TItem[];
	_valueFunc: (item: TItem) => string;
	_textFunc: (item: TItem) => string;
	_defaultValueFunc: (model: TModel, selectList: TItem[]) => string;

	constructor(
		name: string,
		label: string,
		selectListFunc: (model: TModel) => TItem[],
		textFunc: (item: TItem) => string,
		valueFunc: (item: TItem) => string,
		_defaultValueFunc: (model: TModel, selectList: TItem[]) => string,
		stepValue?: string | undefined
	) {
		super(name);
		this.Label = label;
		this.Value = stepValue;
		this._selectListFunc = selectListFunc;
		this._textFunc = textFunc;
		this._valueFunc = valueFunc;
		this._defaultValueFunc = _defaultValueFunc;
		this.SelectList = [];
		makeObservable(this);
	}

	@computed get isCompleted(): boolean {
		return this.Value ? true : false;
	}

	@action.bound refresh(model: TModel, refreshingSelf: boolean) {
		if (refreshingSelf) return;

		this.SelectList = this._selectListFunc(model);
		if (
			!this.Value ||
			!this.SelectList.map((i) => this._valueFunc(i)).includes(this.Value)
		)
			this.setValue(this._defaultValueFunc(model, this.SelectList));
	}

	@action.bound setValue(value: string | undefined) {
		var hasChanged = this.Value !== value;
		this.Value = value;
		if (hasChanged) {
			this.Container?.onStepProgression(this.Container.ByIndex.indexOf(this));
		}
	}

	@computed get getSelectedItem() {
		return (
			this.SelectList.filter((i) => this._valueFunc(i) === this.Value)[0] ||
			undefined
		);
	}

	@action.bound completed(options: TModel): void {}

	render(model: TModel, stepIdx: number) {
		return (
			<StringDropDownStepControl
				model={model}
				step={this}
				stepIndex={stepIdx}
			/>
		);
	}
}

export const StringDropDownStepControl = observer(
	<TModel, TItem>(
		props: StepControlProps<TModel, StringDropDownStepModel<TModel, TItem>>
	) => {
		const [selectedValue, setSelectedValue] = useState<string>();

		function onChange(evt: React.ChangeEvent<HTMLSelectElement>) {
			var field = evt.currentTarget;
			var newValue = field.value;

			setSelectedValue(newValue);
			props.step.setValue(newValue);
		}

		return (
			<div className={`step step-dropdown step-${props.step.Name}`}>
				<label>
					{props.step.Label}:
					<select value={selectedValue} onChange={onChange}>
						{props.step.SelectList.map((i: TItem) => (
							<option
								value={props.step._valueFunc(i)}
								key={`StringDropDown-${props.step.Name}-${props.step._valueFunc(
									i
								)}`}
							>
								{props.step._textFunc(i)}
							</option>
						))}
					</select>
				</label>
			</div>
		);
	}
);
