import { SelectItem } from "../../../helpers/builderHelpers";
import { ICharacterData } from "../BuilderFactory";
import { StepModel, StepState } from "../StepModel";
import { MarkdownWrapper } from "../../../helpers/markdownHelpers";
import "./ChecklistStringStep.css";
import { getTextFieldValueFrom } from "../../../helpers/fieldHelpers";

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
	GetMinimumSelectCount:
		| ((src: TSource, data: TData) => number | undefined)
		| undefined;
	GetMaximumSelectCount:
		| ((src: TSource, data: TData) => number | undefined)
		| undefined;
	GetDefaultValue: (
		source: TSource,
		data: TData,
		lst: string[],
		useDropdownForSingleChoice: boolean
	) => string[] | undefined;
	UseMarkdown?: boolean | undefined;
	UseDropdownForSingleChoice?: boolean | undefined;

	constructor(
		name: string,
		label: string,
		getSelectList: (src: TSource, data: TData) => TItem[],
		getValue: (item: TItem) => string,
		getText: (item: TItem) => string,
		getDefaultValue: (
			source: TSource,
			data: TData,
			lst: string[],
			useDropdownForSingleChoice: boolean
		) => string[] | undefined,
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
		this.GetDefaultValue = getDefaultValue;
	}

	useDropDownForSingleChoice(flag: boolean) {
		this.UseDropdownForSingleChoice = flag;
		return this;
	}

	requiresMinimumSelections(
		getMinimumSelectCount: (src: TSource, data: TData) => number | undefined
	) {
		this.GetMinimumSelectCount = getMinimumSelectCount;
		return this;
	}

	requiresMaximumSelections(
		getMaximumSelectCount: (src: TSource, data: TData) => number | undefined
	) {
		this.GetMaximumSelectCount = getMaximumSelectCount;
		return this;
	}

	useMarkdown(flag: boolean) {
		this.UseMarkdown = flag;
		return this;
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
					selectList.map((x) => x.Value),
					this.UseDropdownForSingleChoice || false
				);

			if (newState.Values)
				newState.Values = newState.Values.filter((x) =>
					selectListValues.includes(x)
				);

			newState.MinimumSelectCount = this.GetMinimumSelectCount
				? this.GetMinimumSelectCount(source, data)
				: undefined;
			newState.MaximumSelectCount = this.GetMaximumSelectCount
				? this.GetMaximumSelectCount(source, data)
				: undefined;

			if (
				newState.Values &&
				newState.MaximumSelectCount !== undefined &&
				newState.Values.length > newState.MaximumSelectCount
			)
				newState.Values = newState.Values.slice(0, newState.MaximumSelectCount);

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
		if (this.UseDropdownForSingleChoice && stepState.MaximumSelectCount === 1)
			return this.renderDropDown(stepState, this.Index, triggerUpdate);

		var index = this.Index;

		function onChange(value: string) {
			var newValues = stepState.Values || [];

			if (newValues.includes(value)) {
				newValues = newValues.filter((x) => x !== value);
			} else {
				if (
					stepState.MaximumSelectCount !== undefined &&
					(stepState.Values || []).length >= stepState.MaximumSelectCount
				)
					return;

				newValues = newValues.concat(value);
			}

			triggerUpdate(index, { Values: newValues });
		}

		return (
			<>
				<div className="title">{this.Label}</div>
				<div className="items">
					{stepState.SelectList.map((i) => (
						<div key={`Checklist-${this.Name}-${i.Value}`}>
							<label>
								<input
									onChange={function () {
										onChange(i.Value);
									}}
									type="checkbox"
									value={i.Value}
									disabled={
										!(stepState.Values || []).includes(i.Value) &&
										stepState.MaximumSelectCount !== undefined &&
										(stepState.Values || []).length >=
											stepState.MaximumSelectCount
									}
									checked={(stepState.Values || []).includes(i.Value)}
								/>
								{this.UseMarkdown ? (
									<MarkdownWrapper inline={true}>{i.Text}</MarkdownWrapper>
								) : (
									i.Text
								)}
							</label>
						</div>
					))}
				</div>
			</>
		);
	}

	renderDropDown(
		stepState: ChecklistStringStepState,
		index: number,
		triggerUpdate: (index: number, stepUpdates: any) => void
	) {
		function onChange(newValue: string) {
			triggerUpdate(index, { Values: [newValue] });
		}

		const value = (stepState && stepState.Values && stepState.Values[0]) || "";

		return (
			<>
				<label>
					{this.Label ? `${this.Label}: ` : ""}
					<select
						value={value}
						onChange={(e) => onChange(getTextFieldValueFrom(e) || "")}
					>
						{(stepState.SelectList || []).map((i) => (
							<option
								value={i.Value}
								key={`StringDropDown-${this.Name}-${i.Value}`}
							>
								{i.Text}
							</option>
						))}
					</select>
				</label>
			</>
		);
	}
}
