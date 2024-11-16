import { SelectItem } from "../../../helpers/builderHelpers";
import { getTextFieldValueFrom } from "../../../helpers/fieldHelpers";
import { ICharacterData } from "../BuilderFactory";
import { StepModel, StepState } from "../StepModel";
import { BuilderDetailText } from "../components/BuilderDetailText";

/**
 * Tracks state for the StringDropDownStep
 */
interface StringDropDownStepState extends StepState {
	SelectList: SelectItem[];
	Value: string | undefined;
	DetailText?: string | undefined;
}

/**
 * Defines detail text to be shown below the drop-down.
 */
interface DetailTextOptions {
	OnlyShowOnMobile?: boolean | undefined;
	UseMarkdown?: boolean | undefined;
}

/**
 * Defines a step that lets the user select a single text value from a drop-down.
 */
export class StringDropDownStep<
	TSource,
	TData extends ICharacterData,
	TItem
> extends StepModel<TSource, TData, StringDropDownStepState> {
	Label: string | undefined;
	GetSelectList: ((src: TSource, data: TData) => TItem[]) | undefined;
	GetValue: ((item: TItem) => string) | undefined;
	GetText: ((item: TItem) => string) | undefined;
	GetDefaultValue:
		| ((source: TSource, data: TData, lst: string[]) => string | undefined)
		| undefined;
	GetDetailText: ((item: TItem) => string | undefined) | undefined;
	DetailTextOptions?: DetailTextOptions | undefined;

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
	 * Defines the list of available items in the select list.
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
			| ((source: TSource, data: TData, lst: string[]) => string | undefined)
			| undefined
	) {
		this.GetDefaultValue = defaultValueFunc;
		return this;
	}

	controlTypeId(): string {
		return "stringdropdown";
	}

	withDetailText(
		getDetailText: ((item: TItem) => string | undefined) | undefined,
		opts?: DetailTextOptions | undefined
	) {
		this.GetDetailText = getDetailText;
		this.DetailTextOptions = opts;
		return this;
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

	updateStateInternal(
		source: TSource,
		data: TData,
		newState: StringDropDownStepState
	) {
		if (!newState.IsVisible) {
			this.clearState(newState);
			newState.IsCompleted = true;
		} else {
			var selectListSource =
				(this.GetSelectList && this.GetSelectList(source, data)) || [];
			var selectList = selectListSource.map((itm, idx) => {
				return {
					Text: (this.GetText && this.GetText(itm)) || "(item)",
					Value: this.GetValue ? this.GetValue(itm) : idx.toString(),
				};
			});

			newState.SelectList = selectList;

			if (
				newState.Value === undefined ||
				!selectList.any((x) => x.Value === newState.Value)
			) {
				newState.Value =
					(this.GetDefaultValue &&
						this.GetDefaultValue(
							source,
							data,
							selectList.map((x) => x.Value)
						)) ||
					undefined;
			}

			newState.DetailText = this.GetDetailText
				? this.GetDetailText(
						selectListSource.filter(
							(x) => this.GetValue && this.GetValue(x) === newState.Value
						)[0]
				  )
				: undefined;

			newState.IsCompleted = newState.Value ? true : false;
		}
	}

	renderInternal(
		stepState: StringDropDownStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	) {
		var index = this.Index;

		function onChange(evt: React.ChangeEvent<HTMLSelectElement>) {
			triggerUpdate(index, { Value: getTextFieldValueFrom(evt) });
		}

		return (
			<>
				<label>
					{this.Label ? `${this.Label}: ` : ""}
					<select value={stepState.Value} onChange={onChange}>
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
				<BuilderDetailText
					text={stepState.DetailText}
					useMarkdown={this.DetailTextOptions?.UseMarkdown}
					onlyOnMobile={this.DetailTextOptions?.OnlyShowOnMobile}
				/>
			</>
		);
	}
}
