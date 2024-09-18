import { StepModel, StepState } from "../../models/StepModel";

interface StringDropDownStepState extends StepState {
	SelectList: DropDownItem[];
	Value: string | undefined;
}

interface DropDownItem {
	Value: string;
	Text: string;
}

export class StringDropDownStep<TSource, TData, TItem> extends StepModel<
	TSource,
	TData,
	StringDropDownStepState
> {
	Label: string;
	GetSelectList: (src: TSource, data: TData) => TItem[];
	GetValue: (item: TItem) => string;
	GetText: (item: TItem) => string;
	GetDefaultValue: (
		source: TSource,
		data: TData,
		lst: string[]
	) => string | undefined;

	constructor(
		name: string,
		label: string,
		getSelectList: (src: TSource, data: TData) => TItem[],
		getValue: (item: TItem) => string,
		getText: (item: TItem) => string,
		getDefaultValue: (
			source: TSource,
			data: TData,
			lst: string[]
		) => string | undefined,
		updateCharacter: (
			source: TSource,
			state: StringDropDownStepState,
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

	initializeState(): StringDropDownStepState {
		return { IsCompleted: false, IsVisible: false, SelectList: [], Value: "" };
	}

	clearState(newState: StringDropDownStepState) {
		newState.Value = undefined;
		newState.SelectList = [];
	}

	updateState(source: TSource, data: TData, newState: StringDropDownStepState) {
		var selectList = this.GetSelectList(source, data).map((itm) => {
			return {
				Text: this.GetText(itm),
				Value: this.GetValue(itm),
			};
		});

		newState.SelectList = selectList;

		if (
			newState.Value === undefined ||
			!selectList.any((x) => x.Value === newState.Value)
		) {
			newState.Value = this.GetDefaultValue(
				source,
				data,
				selectList.map((x) => x.Value)
			);
		}

		newState.IsCompleted = newState.Value ? true : false;
		newState.IsVisible = true;
	}

	render(
		stepState: StringDropDownStepState,
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
						{stepState.SelectList.map((i) => (
							<option
								value={i.Value}
								key={`StringDropDown-${this.Name}-${i.Value}`}
							>
								{i.Text}
							</option>
						))}
					</select>
				</label>
			</div>
		);
	}
}
