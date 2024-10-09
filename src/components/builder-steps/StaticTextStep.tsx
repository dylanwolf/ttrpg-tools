import Markdown from "react-markdown";
import { StepModel, StepState } from "../../state/character-builder/StepModel";
import { ICharacterData } from "../../state/character-builder/BuilderTabSessions";

interface StaticTextStepState extends StepState {
	Value: string;
}

export class StaticTextStep<
	TSource,
	TData extends ICharacterData
> extends StepModel<TSource, TData, StaticTextStepState> {
	Label: string;
	AcceptMarkdown: boolean;
	GetValue: (src: TSource, data: TData) => string;

	constructor(
		name: string,
		label: string,
		acceptMarkdown: boolean,
		getValue: (src: TSource, data: TData) => string,
		updateCharacter: (
			source: TSource,
			state: StaticTextStepState,
			newData: TData
		) => void
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.AcceptMarkdown = acceptMarkdown;
		this.GetValue = getValue;
	}

	controlTypeId(): string {
		return "statictext";
	}

	initializeState(): StaticTextStepState {
		return {
			IsCompleted: true,
			IsVisible: this.GetIsVisible ? false : true,
			Value: "",
		};
	}

	clearState(newState: StaticTextStepState): void {
		newState.Value = "";
	}

	updateStateInternal(
		source: TSource,
		data: TData,
		newState: StaticTextStepState
	): void {
		if (newState.IsVisible) {
			newState.Value = this.GetValue(source, data);
		}
	}

	renderInternal(
		stepState: StaticTextStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		return (
			<>
				{this.AcceptMarkdown ? (
					<>
						<div className="title">{this.Label}</div>
						<div className="step-markdown">
							<Markdown>{stepState.Value}</Markdown>
						</div>
					</>
				) : (
					<>
						{this.Label}: {stepState.Value}
					</>
				)}
			</>
		);
	}
}
