import { StepModel, StepState } from "../StepModel";
import { ICharacterData } from "../BuilderFactory";
import { MarkdownWrapper } from "../../../helpers/markdownHelpers";

/**
 * Tracks the state of a StaticTextStep
 */
interface StaticTextStepState extends StepState {
	Value: string;
}

/**
 * Defines a step that will display a bit of static text as either plan text or markdown. This can also be used to transfer the static text value to character data (e.g., for version numbers).
 */
export class StaticTextStep<
	TSource,
	TData extends ICharacterData
> extends StepModel<TSource, TData, StaticTextStepState> {
	Label: string | undefined;
	AcceptMarkdown: boolean = false;
	GetValue: (src: TSource, data: TData) => string;

	constructor(name: string, getValue: (src: TSource, data: TData) => string) {
		super(name);
		this.GetValue = getValue;
	}

	/**
	 * Defines the label that will be shown with the text.
	 * @param label
	 * @returns
	 */
	withLabel(label: string | undefined) {
		this.Label = label;
		return this;
	}

	/**
	 * Determines whether the text will be rendered as plain text (on a single line) or markdown (multi-line)
	 * @param flag
	 * @returns
	 */
	useMarkdown(flag: boolean) {
		this.AcceptMarkdown = flag;
		return this;
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
						{this.Label ? <div className="title">{this.Label}</div> : <></>}
						<div className="step-markdown">
							<MarkdownWrapper>{stepState.Value}</MarkdownWrapper>
						</div>
					</>
				) : (
					<>
						{this.Label ? `${this.Label}: ` : ""}
						{stepState.Value}
					</>
				)}
			</>
		);
	}
}
