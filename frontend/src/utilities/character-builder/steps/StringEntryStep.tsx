import { getTextFieldValueFrom } from "../../../helpers/fieldHelpers";
import { ICharacterData } from "../BuilderFactory";
import { StepModel, StepState } from "../StepModel";

/**
 * Tracks the state of a StringEntryStep.
 */
interface StringEntryStepState extends StepState {
	Value: string | undefined;
}

/**
 * Defines a step that accepts a single-line free text entry.
 */
export class StringEntryStep<
	TSource,
	TData extends ICharacterData
> extends StepModel<TSource, TData, StringEntryStepState> {
	Label: string | undefined;
	GetDefaultValue:
		| ((source: TSource, data: TData) => string | undefined)
		| undefined;

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
	 * Defines a function used to set the value when the step loads. This function should load data from existing character data if availble, or supply a value for new characters.
	 * @param defaultValueFunc
	 * @returns
	 */
	withDefaultValue(
		defaultValueFunc:
			| ((source: TSource, data: TData) => string | undefined)
			| undefined
	) {
		this.GetDefaultValue = defaultValueFunc;
		return this;
	}

	controlTypeId(): string {
		return "stringentry";
	}

	initializeState(): StringEntryStepState {
		return {
			IsCompleted: false,
			IsVisible: this.GetIsVisible ? false : true,
			Value: undefined,
		};
	}

	clearState(newState: StringEntryStepState): void {
		newState.Value = undefined;
	}

	updateStateInternal(
		source: TSource,
		data: TData,
		newState: StringEntryStepState
	): void {
		if (!newState.IsVisible) {
			this.clearState(newState);
			newState.IsCompleted = true;
		} else {
			if (newState.Value === undefined) {
				newState.Value =
					this.GetDefaultValue && this.GetDefaultValue(source, data);
			}

			newState.IsCompleted = this.IsRequired
				? newState.Value
					? true
					: false
				: true;
		}
	}
	renderInternal(
		stepState: StringEntryStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var index = this.Index;

		function onChange(evt: React.ChangeEvent<HTMLInputElement>) {
			triggerUpdate(index, { Value: getTextFieldValueFrom(evt) || "" });
		}

		return (
			<>
				<label>
					{this.Label ? `${this.Label}: ` : ""}
					<input type="text" value={stepState.Value} onChange={onChange} />
				</label>
			</>
		);
	}
}
