import { StepModel, StepState } from "../../state/StepModel";

interface StringEntryStepState extends StepState {
	Value: string | undefined;
}

export class StringEntryStep<TSource, TData> extends StepModel<
	TSource,
	TData,
	StringEntryStepState
> {
	Label: string;
	IsRequired: boolean;
	GetDefaultValue: (source: TSource, data: TData) => string | undefined;
	GetIsVisible: ((src: TSource, data: TData) => boolean) | undefined;

	constructor(
		name: string,
		label: string,
		getDefaultValue: (source: TSource, data: TData) => string | undefined,
		updateCharacter: (
			source: TSource,
			state: StringEntryStepState,
			newData: TData
		) => void,
		isRequired?: boolean | undefined,
		getIsVisible?: ((src: TSource, data: TData) => boolean) | undefined
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.GetDefaultValue = getDefaultValue;
		this.GetIsVisible = getIsVisible;
		this.IsRequired = isRequired || false;
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

	updateState(
		source: TSource,
		data: TData,
		newState: StringEntryStepState
	): void {
		newState.IsVisible = this.GetIsVisible
			? this.GetIsVisible(source, data)
			: true;

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
	render(
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
			<div
				className={`step step-stringentry step-${this.Name} step-${
					stepState.IsCompleted ? "complete" : "incomplete"
				}`}
			>
				<label>
					{this.Label ? `${this.Label}:` : ""}
					<input type="text" value={stepState.Value} onChange={onChange} />
				</label>
			</div>
		);
	}
}
