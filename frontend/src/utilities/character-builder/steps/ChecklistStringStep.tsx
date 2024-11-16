import { SelectItem } from "../../../helpers/builderHelpers";
import { ICharacterData } from "../BuilderFactory";
import { StepModel, StepState } from "../StepModel";
import { MarkdownWrapper } from "../../../helpers/markdownHelpers";
import "./ChecklistStringStep.css";
import { getTextFieldValueFrom } from "../../../helpers/fieldHelpers";
import { faThemeisle } from "@fortawesome/free-brands-svg-icons";

/**
 * Tracks state of a ChecklistStringStep.
 */
interface ChecklistStringStepState extends StepState {
	/**
	 * The list of possible values.
	 */
	SelectList: SelectItem[];
	/**
	 * The list of selected values.
	 */
	Values: string[] | undefined;
	/**
	 * Minimum number of selections. If this is not met, the step will not be marked as complete.
	 */
	MinimumSelectCount?: number | undefined;
	/**
	 * Maximum number of selections. If this is met, the step will not allow any other selections.
	 */
	MaximumSelectCount?: number | undefined;
}

/**
 * Defines a step where a set of values can be selected from a checklist.
 */
export class ChecklistStringStep<
	TSource,
	TData extends ICharacterData,
	TItem
> extends StepModel<TSource, TData, ChecklistStringStepState> {
	Label: string | undefined;
	GetSelectList: ((src: TSource, data: TData) => TItem[]) | undefined;
	GetValue: ((item: TItem) => string) | undefined;
	GetText: ((item: TItem) => string) | undefined;
	GetMinimumSelectCount:
		| ((src: TSource, data: TData) => number | undefined)
		| undefined;
	GetMaximumSelectCount:
		| ((src: TSource, data: TData) => number | undefined)
		| undefined;
	GetDefaultValue:
		| ((
				source: TSource,
				data: TData,
				lst: string[],
				useDropdownForSingleChoice: boolean
		  ) => string[] | undefined)
		| undefined;
	UseMarkdown?: boolean | undefined;
	UseDropdownForSingleChoice?: boolean | undefined;

	constructor(name: string) {
		super(name);
	}

	/**
	 * Defines the label to show along with this field.
	 * @param label
	 * @returns
	 */
	withLabel(label: string | undefined) {
		this.Label = label;
		return this;
	}

	/**
	 * Defines the list of available items in the checklist.
	 * @param getFunc
	 * @returns
	 */
	withSelectList(
		getFunc: ((src: TSource, data: TData) => TItem[]) | undefined
	) {
		this.GetSelectList = getFunc;
		return this;
	}

	/**
	 * Defines the function used to get the value of an item.
	 * @param valueFunc
	 * @returns
	 */
	withItemValue(valueFunc: ((item: TItem) => string) | undefined) {
		this.GetValue = valueFunc;
		return this;
	}

	/**
	 * Defines the function used to get the displayed text of the item.
	 * @param textFunc
	 * @returns
	 */
	withItemText(textFunc: ((item: TItem) => string) | undefined) {
		this.GetText = textFunc;
		return this;
	}

	/**
	 * Defines a function used to set the value when the step loads. This function should load data from existing character data if availble, or supply a value for new characters.
	 * @param defaultValueFunc
	 * @returns
	 */
	withDefaultValue(
		defaultValueFunc:
			| ((
					source: TSource,
					data: TData,
					lst: string[],
					useDropdownForSingleChoice: boolean
			  ) => string[] | undefined)
			| undefined
	) {
		this.GetDefaultValue = defaultValueFunc;
		return this;
	}

	/**
	 * Defines whether the checklist should be replaced with a drop-down list if there is only one choice allowed (based on maximum selection).
	 * @param flag
	 * @returns
	 */
	useDropDownForSingleChoice(flag: boolean) {
		this.UseDropdownForSingleChoice = flag;
		return this;
	}

	/**
	 * Defines the function used to determine the minimum number of selections. If this function returns a value and that number of items are not checked, the step will not be marked as complete.
	 * @param getMinimumSelectCount
	 * @returns
	 */
	requiresMinimumSelections(
		getMinimumSelectCount: (src: TSource, data: TData) => number | undefined
	) {
		this.GetMinimumSelectCount = getMinimumSelectCount;
		return this;
	}

	/**
	 * Defines the function used to determine the maximum number of selections. If this function returns a value, the list of selections will be truncated to that number and no further selections will be allowed once it reaches the maximum.
	 * @param getMaximumSelectCount
	 * @returns
	 */
	requiresMaximumSelections(
		getMaximumSelectCount: (src: TSource, data: TData) => number | undefined
	) {
		this.GetMaximumSelectCount = getMaximumSelectCount;
		return this;
	}

	/**
	 * If true, the checklist item text should be rendered as markdown.
	 * @param flag
	 * @returns
	 */
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
			var selectList = (
				(this.GetSelectList && this.GetSelectList(source, data)) ||
				[]
			).map((itm, idx) => {
				return {
					Text: this.GetText ? this.GetText(itm) : "(text)",
					Value: this.GetValue ? this.GetValue(itm) : idx.toString(),
				};
			});

			newState.SelectList = selectList;

			var selectListValues = selectList.map((x) => x.Value);

			if (newState.Values === undefined)
				newState.Values =
					this.GetDefaultValue &&
					this.GetDefaultValue(
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
				{this.Label ? <div className="title">{this.Label}</div> : <></>}
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
