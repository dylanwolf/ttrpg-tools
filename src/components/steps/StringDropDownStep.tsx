import { StepModel, StepState } from "../../models/StepModel";

interface StringDropDownStepState<TItem> extends StepState {
	SelectList: TItem[];
	Value: string | undefined;
}

export class StringDropDownStep<TSource, TData, TItem> extends StepModel<
	TSource,
	TData,
	StringDropDownStepState<TItem>
> {
	Label: string;
	GetSelectList: (src: TSource, data: TData) => TItem[];
	GetValue: (item: TItem) => string;
	GetText: (item: TItem) => string;
	GetDefaultValue: (source: TSource, data: TData, lst: TItem[]) => string;

	constructor(
		name: string,
		label: string,
		getSelectList: (src: TSource, data: TData) => TItem[],
		getValue: (item: TItem) => string,
		getText: (item: TItem) => string,
		getDefaultValue: (source: TSource, data: TData, lst: TItem[]) => string,
		updateCharacter: (
			source: TSource,
			state: StringDropDownStepState<TItem>,
			newData: TData
		) => void
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.GetSelectList = getSelectList;
		this.GetValue = getValue;
		this.GetText = getText;
		this.GetDefaultValue = getDefaultValue;
	}

	initializeState(): StringDropDownStepState<TItem> {
		return { IsCompleted: false, IsVisible: false, SelectList: [], Value: "" };
	}

	updateState(
		source: TSource,
		data: TData,
		newState: StringDropDownStepState<TItem>
	) {
		var selectList = this.GetSelectList(source, data);
		newState.SelectList = selectList;

		if (
			newState.Value === undefined ||
			!selectList.any((x) => this.GetValue(x) === newState.Value)
		) {
			newState.Value = this.GetDefaultValue(source, data, selectList);
		}

		newState.IsCompleted = newState.Value ? true : false;
		newState.IsVisible = true;
	}

	render(
		stepState: StringDropDownStepState<TItem>,
		triggerUpdate: (index: number, stepUpdates: any) => void
	) {
		var index = this.Index;

		function onChange(evt: React.ChangeEvent<HTMLSelectElement>) {
			var field = evt.currentTarget;
			var newValue = field.value;

			triggerUpdate(index, { Value: newValue });
		}

		return (
			<div className={`step step-dropdown step-${this.Name}`}>
				<label>
					{this.Label ? `${this.Label}:` : ""}
					<select value={stepState.Value} onChange={onChange}>
						{stepState.SelectList.map((i: TItem) => (
							<option
								value={this.GetValue(i)}
								key={`StringDropDown-${this.Name}-${this.GetValue(i)}`}
							>
								{this.GetText(i)}
							</option>
						))}
					</select>
				</label>
			</div>
		);
	}
}
