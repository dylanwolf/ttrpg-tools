import { SelectItem } from "../../../helpers/builderHelpers";
import { ICharacterData } from "../BuilderFactory";
import { StepModel, StepState } from "../StepModel";

interface ChecklistStringStepState extends StepState {
	SelectList: SelectItem[];
	Values: string[] | undefined;
	MinimumSelectCount?: number | undefined;
	MaximumSelectCount?: number | undefined;
}

export class ChecklistStringStep<
	TSource,
	TData extends ICharacterData,
	TItem
> extends StepModel<TSource, TData, ChecklistStringStepState> {
	Label: string;
	GetSelectList: (src: TSource, data: TData) => TItem[];
	GetValue: (item: TItem) => string;
	GetText: (item: TItem) => string;
	GetMinimumSelectCount: (src: TSource, data: TData) => number | undefined;
	GetMaximumSelectCount: (src: TSource, data: TData) => number | undefined;
	GetDefaultValue: (
		source: TSource,
		data: TData,
		lst: string[]
	) => string[] | undefined;
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
		) => string[] | undefined,
		getMinimumSelectCount: (src: TSource, data: TData) => number | undefined,
		getMaximumSelectCount: (src: TSource, data: TData) => number | undefined,
		updateCharacter: (
			source: TSource,
			state: ChecklistStringStepState,
			newData: TData
		) => void
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.GetSelectList = getSelectList;
		this.GetValue = getValue;
		this.GetText = getText;
		this.GetMinimumSelectCount = getMinimumSelectCount;
		this.GetMaximumSelectCount = getMaximumSelectCount;
		this.GetDefaultValue = getDefaultValue;
	}

	controlTypeId(): string {
		return "checkliststring";
	}

	initializeState(): ChecklistStringStepState {
		return {
			IsCompleted: !this.IsRequired,
			SelectList: [],
			Values: undefined,
			IsVisible: this.GetIsVisible ? false : true,
		};
	}

	clearState(newState: ChecklistStringStepState): void {
		newState.Values = [];
		newState.SelectList = [];
		newState.MinimumSelectCount = undefined;
		newState.MaximumSelectCount = undefined;
	}

	updateStateInternal(
		source: TSource,
		data: TData,
		newState: ChecklistStringStepState
	): void {
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

			var selectListValues = selectList.map((x) => x.Value);

			if (newState.Values === undefined)
				newState.Values = this.GetDefaultValue(
					source,
					data,
					selectList.map((x) => x.Value)
				);

			if (newState.Values)
				newState.Values = newState.Values.filter((x) =>
					selectListValues.includes(x)
				);

			newState.MinimumSelectCount = this.GetMinimumSelectCount(source, data);
			newState.MaximumSelectCount = this.GetMaximumSelectCount(source, data);

			newState.IsCompleted = this.IsRequired
				? !newState.MinimumSelectCount ||
				  (newState.Values || []).length >= newState.MinimumSelectCount
				: true;
		}
	}
	renderInternal(
		stepState: ChecklistStringStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var index = this.Index;

		function onChange(value: string) {
			if (
				stepState.MaximumSelectCount &&
				(stepState.Values || []).length >= stepState.MaximumSelectCount
			)
				return;

			var newValues = stepState.Values || [];
			if (newValues.includes(value)) {
				newValues = newValues.filter((x) => x !== value);
			} else {
				newValues = newValues.concat(value);
			}

			triggerUpdate(index, { Values: newValues });
		}

		return (
			<>
				<div className="title">{this.Label}</div>
				<div className="items">
					{stepState.SelectList.map((i) => (
						<label key={`Checklist-${this.Name}-${i.Value}`}>
							<input
								onChange={function () {
									onChange(i.Value);
								}}
								type="checkbox"
								value={i.Value}
								disabled={
									!(stepState.Values || []).includes(i.Value) &&
									stepState.MaximumSelectCount !== undefined &&
									stepState.SelectList.length >= stepState.MaximumSelectCount
								}
								checked={(stepState.Values || []).includes(i.Value)}
							/>
							{i.Text}
						</label>
					))}
				</div>
			</>
		);
	}
}
