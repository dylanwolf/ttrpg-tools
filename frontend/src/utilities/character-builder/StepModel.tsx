import { mergeStateWithUpdates } from "../../helpers/builderHelpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons/faCircleInfo";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { CharacterBuilderUpdate } from "./BuilderTabSessions";
import { ICharacterData } from "./BuilderFactory";

/**
 * Keeps state for an entire step runner process.
 */
export interface StepRunnerState {
	CurrentStep: number;
	Steps: StepState[];
}

/**
 * Keeps state for a step runner process that will be stored in a tab session.
 */
export interface RootStepCollectionState extends StepRunnerState {
	SessionKey: string;
}

/**
 * Basis for state for an individual character builder step.
 */
export interface StepState {
	/**
	 * Indicates the step is complete, and the process can move on to the next step if it is required.
	 */
	IsCompleted: boolean;
	/**
	 * Indicates the step is visible.
	 */
	IsVisible: boolean;
}

/**
 * Base class for a single step in the character builder process.
 */
export abstract class StepModel<
	TSource,
	TData extends ICharacterData,
	TState extends StepState
> {
	Name: string;
	Index: number = 0;
	UpdateCharacter:
		| ((source: TSource, state: TState, newData: TData) => void)
		| undefined;
	GetIsVisible?: ((source: TSource, data: TData) => boolean) | undefined;
	IsRequired: boolean;
	HelpComponent: JSX.Element | string | undefined;

	/**
	 * Create a new StepModel with base values.
	 * @param name A unique ID for the step.
	 * @param updateCharacter The function used to apply step state to character data.
	 */
	constructor(name: string) {
		this.Name = name;
		this.IsRequired = false;
	}

	onCharacterUpdate(
		updateFunc:
			| ((source: TSource, state: TState, newData: TData) => void)
			| undefined
	) {
		this.UpdateCharacter = updateFunc;
		return this;
	}

	/**
	 * The unique ID for this step type. Used in CSS styling.
	 */
	abstract controlTypeId(): string;

	/**
	 * Indicates that this step is required, and flow should not continue if it is not complete.
	 * @returns
	 */
	isRequired() {
		this.IsRequired = true;
		return this;
	}

	/**
	 * If getIsVisisble is specified, indicates that this step should only be shown when the value of the function returns true.
	 * @param getIsVisible
	 * @returns
	 */
	onlyShowWhen(
		getIsVisible: ((source: TSource, data: TData) => boolean) | undefined
	) {
		this.GetIsVisible = getIsVisible;
		return this;
	}

	/**
	 * Indicates a help popup should be shown on this step, with the given content visible.
	 * @param content
	 * @returns
	 */
	withHelp(content: JSX.Element | string | undefined) {
		this.HelpComponent = content;
		return this;
	}

	/**
	 * Creates a new instance of step state for this step.
	 */
	abstract initializeState(): TState;

	/**
	 * Clears values on newState when this step is not visible.
	 * @param newState
	 */
	abstract clearState(newState: TState): void;

	/**
	 * Updates this step when it is processed.
	 * @param source Source data for the character builder.
	 * @param data Character data for the character builder. This should only be read during this function.
	 * @param newState New step state for this step. This should be updated to reflect what will be shown to the user after this update completes.
	 */
	abstract updateStateInternal(
		source: TSource,
		data: TData,
		newState: TState
	): void;

	/**
	 * Updates this step when it is processed.
	 * @param source Source data for the character builder.
	 * @param data Character data for the character builder. This should only be read during this function.
	 * @param newState New step state for this step. This should be updated to reflect what will be shown to the user after this update completes.
	 */
	updateState(source: TSource, data: TData, newState: TState): void {
		newState.IsVisible = this.GetIsVisible
			? this.GetIsVisible(source, data)
			: true;

		this.updateStateInternal(source, data, newState);

		if (!newState.IsVisible) newState.IsCompleted = true;
	}

	/**
	 * Renders the contents of this step.
	 * @param stepState The step state for this step.
	 * @param triggerUpdate A function that is called when this step is updated by the user. Includes the index of the step being changed and the step state properties that will change.
	 */
	abstract renderInternal(
		stepState: TState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element;

	/**
	 * Renders the contents of this step.
	 * @param stepState The step state for this step.
	 * @param triggerUpdate A function that is called when this step is updated by the user. Includes the index of the step being changed and the step state properties that will change.
	 * @returns
	 */
	render(
		stepState: TState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		const helpComponentPopover = this.HelpComponent ? (
			<Popover>
				<Popover.Body>{this.HelpComponent}</Popover.Body>
			</Popover>
		) : (
			<></>
		);

		return (
			<div
				className={`step step-${this.controlTypeId()} step-${this.Name} step-${
					stepState.IsCompleted ? "complete" : "incomplete"
				}`}
			>
				{this.HelpComponent ? (
					<div className="step-help">
						<OverlayTrigger
							trigger={["hover", "focus"]}
							overlay={helpComponentPopover}
						>
							<FontAwesomeIcon icon={faCircleInfo} />
						</OverlayTrigger>
					</div>
				) : (
					<></>
				)}
				{this.renderInternal(stepState, triggerUpdate)}
			</div>
		);
	}
}

/**
 * Class that runs a series of StepModel objects.
 */
export class StepRunner<TSource, TData extends ICharacterData> {
	Name: string;
	ByIndex: StepModel<TSource, TData, any>[];
	ByKey: { [key: string]: StepModel<TSource, TData, any> } = {};

	constructor(name: string, steps: StepModel<TSource, TData, any>[]) {
		this.Name = name;
		this.ByIndex = steps;

		steps.forEach((step, idx) => {
			this.ByKey[step.Name] = step;
			step.Index = idx;
		});
	}

	initializeState(): StepRunnerState {
		return {
			CurrentStep: -1,
			Steps: this.ByIndex.map((s) => s.initializeState()),
		};
	}

	/**
	 * Called whenever a parent object is updated (for containers or foreach steps that run a StepRunner inside the process). This assumes that the character data parameter (newData) has already been cloned.
	 * @param source
	 * @param newData
	 * @param state
	 * @param changedStep
	 * @param stepUpdates
	 * @returns
	 */
	onParentStepUpdated(
		source: TSource,
		newData: TData,
		state: StepRunnerState,
		changedStep: number,
		stepUpdates?: any
	) {
		var newState: StepRunnerState = {
			Steps: [],
			CurrentStep: state.CurrentStep,
		};

		if (newState.CurrentStep === -1) newState.CurrentStep = 0;

		var startStep = changedStep;
		var endStep = startStep + 1;

		console.debug(
			`${this.Name} onStepUpdated(${changedStep}, ${startStep}, ${endStep})`
		);
		//console.debug(state);
		//console.debug(newData);

		var inCompleted = true;
		for (var idx = 0; idx < state.Steps.length; idx++) {
			var step = this.ByIndex[idx];
			console.debug(
				`${this.Name} Processing step ${idx} (${startStep} - ${endStep})`
			);
			console.debug(step);

			// If no matching step, continue
			if (!step) {
				newState.Steps.push(state.Steps[idx]);
				continue;
			}

			var stepState = mergeStateWithUpdates(
				state.Steps[idx],
				(idx === changedStep && stepUpdates) || undefined
			);
			console.debug(stepState);

			// Re-process steps that may be affected
			if (idx >= startStep && idx <= endStep) {
				step.updateState(source, newData, stepState);
				// console.debug(stepState);
				// console.debug(newData);
			}

			if (step.UpdateCharacter)
				step.UpdateCharacter(source, stepState, newData);

			newState.Steps.push(stepState);

			if (inCompleted && !stepState.IsCompleted) {
				newState.CurrentStep = idx;
				inCompleted = false;
			}

			// If we finished this step, move on to the next
			if (stepState.IsCompleted && endStep <= idx) {
				endStep = idx + 1;
			}
		}

		if (inCompleted) newState.CurrentStep = endStep + 1;

		return {
			NewStepState: newState,
			NewCharacterData: newData,
		};
	}

	/**
	 * Called when a step within this step runner is updated. Clones the current character data parameter so that it can be updated and stored in Redux state.
	 * @param source
	 * @param data
	 * @param state
	 * @param changedStep
	 * @param stepUpdates
	 * @returns
	 */
	onStepUpdated(
		source: TSource,
		data: TData,
		state: StepRunnerState,
		changedStep: number,
		stepUpdates?: any
	) {
		var newData = structuredClone(data);
		return this.onParentStepUpdated(
			source,
			newData,
			state,
			changedStep,
			stepUpdates
		);
	}
}

/**
 * StepRunner for the top-level step collection in a character builder.
 */
export class RootStepCollection<
	TSource,
	TData extends ICharacterData
> extends StepRunner<TSource, TData> {
	BuilderKey: string;
	GetInitialCharacterData: () => TData;
	SupportsPDFFormFill: boolean;
	ToPdfFormFillParams: ((src: TSource, data: TData) => any) | undefined;

	constructor(
		builderKey: string,
		steps: StepModel<TSource, TData, any>[],
		getInitialCharacterData: () => TData,
		toPdfFormFillParams?: ((src: TSource, data: TData) => any) | undefined
	) {
		super("Root", steps);
		this.BuilderKey = builderKey;
		this.GetInitialCharacterData = getInitialCharacterData;
		this.SupportsPDFFormFill = toPdfFormFillParams ? true : false;
		this.ToPdfFormFillParams = toPdfFormFillParams;
	}

	initializeRootState(sessionKey: string): RootStepCollectionState {
		return {
			SessionKey: sessionKey,
			...this.initializeState(),
		};
	}

	onRootStepUpdated(
		source: TSource,
		data: TData,
		state: RootStepCollectionState,
		changedStep: number,
		stepUpdates?: any
	): CharacterBuilderUpdate<TData> {
		var newState = this.onStepUpdated(
			source,
			data,
			state,
			changedStep,
			stepUpdates
		);
		return {
			NewCharacterData: newState.NewCharacterData,
			NewStepState: {
				SessionKey: state.SessionKey,
				...newState.NewStepState,
			},
		};
	}
}
