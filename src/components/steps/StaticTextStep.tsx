import Markdown from "react-markdown";
import { StepModel, StepState } from "../../state/StepModel";

interface StaticTextStepState extends StepState {
	Value: string;
}

export class StaticTextStep<TSource, TData> extends StepModel<
	TSource,
	TData,
	StaticTextStepState
> {
	Label: string;
	AcceptMarkdown: boolean;
	GetValue: (src: TSource, data: TData) => string;
	GetIsVisible: ((src: TSource, data: TData) => boolean) | undefined;

	constructor(
		name: string,
		label: string,
		acceptMarkdown: boolean,
		getValue: (src: TSource, data: TData) => string,
		updateCharacter: (
			source: TSource,
			state: StaticTextStepState,
			newData: TData
		) => void,
		getIsVisible?: ((src: TSource, data: TData) => boolean) | undefined
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.AcceptMarkdown = acceptMarkdown;
		this.GetValue = getValue;
		this.GetIsVisible = getIsVisible;
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

	updateState(
		source: TSource,
		data: TData,
		newState: StaticTextStepState
	): void {
		newState.IsVisible = this.GetIsVisible
			? this.GetIsVisible(source, data)
			: true;

		if (newState.IsVisible) {
			newState.Value = this.GetValue(source, data);
		}
	}

	render(
		stepState: StaticTextStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		return (
			<div
				className={`step step-statictext step-${this.Name} step-${
					stepState.IsCompleted ? "complete" : "incomplete"
				}`}
			>
				{this.AcceptMarkdown ? (
					<>
						{" "}
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
			</div>
		);
	}
}
