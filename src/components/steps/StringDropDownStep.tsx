import { SelectItem } from "../../helpers/builderHelpers";
import { StepModel, StepState } from "../../state/StepModel";

interface StringDropDownStepState extends StepState {
	SelectList: SelectItem[];
	Value: string | undefined;
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
	GetIsVisible: ((src: TSource, data: TData) => boolean) | undefined;

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
		) => void,
		getIsVisible?: ((src: TSource, data: TData) => boolean) | undefined
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.GetSelectList = getSelectList;
		this.GetValue = getValue;
		this.GetText = getText;
		this.GetDefaultValue = getDefaultValue;
		this.GetIsVisible = getIsVisible;
	}

	initializeState(): StringDropDownStepState {
		return {
			IsCompleted: false,
			IsVisible: this.GetIsVisible ? false : true,
			SelectList: [],
			Value: undefined,
		};
	}

	clearState(newState: StringDropDownStepState) {
		newState.Value = undefined;
		newState.SelectList = [];
	}

	updateState(source: TSource, data: TData, newState: StringDropDownStepState) {
		newState.IsVisible = this.GetIsVisible
			? this.GetIsVisible(source, data)
			: true;

		if (!newState.IsVisible) {
			this.clearState(newState);
			newState.IsCompleted = true;
		} else {
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
		}
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
			<div
				className={`step step-dropdown step-${this.Name} step-${stepState.IsCompleted ? "complete" : "incomplete"
					}`}
			>
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
