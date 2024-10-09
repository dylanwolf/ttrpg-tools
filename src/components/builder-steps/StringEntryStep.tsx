import { ICharacterData } from "../../state/character-builder/BuilderTabSessions";
import { StepModel, StepState } from "../../state/character-builder/StepModel";

interface StringEntryStepState extends StepState {
	Value: string | undefined;
}

export class StringEntryStep<
	TSource,
	TData extends ICharacterData
> extends StepModel<TSource, TData, StringEntryStepState> {
	Label: string;
	GetDefaultValue: (source: TSource, data: TData) => string | undefined;

	constructor(
		name: string,
		label: string,
		getDefaultValue: (source: TSource, data: TData) => string | undefined,
		updateCharacter: (
			source: TSource,
			state: StringEntryStepState,
			newData: TData
		) => void
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.GetDefaultValue = getDefaultValue;
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
				newState.Value = this.GetDefaultValue(source, data);
			}

			newState.IsCompleted = newState.Value ? true : false;
		}
	}
	renderInternal(
		stepState: StringEntryStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var index = this.Index;

		function onChange(evt: React.ChangeEvent<HTMLInputElement>) {
			var field = evt.currentTarget;
			var newValue = field.value;

			triggerUpdate(index, { Value: newValue });
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
