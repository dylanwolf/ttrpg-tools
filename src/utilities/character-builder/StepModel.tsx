import { mergeStateWithUpdates } from "../../helpers/builderHelpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons/faCircleInfo";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { CharacterBuilderUpdate } from "./BuilderTabSessions";
import { ICharacterData } from "./BuilderFactory";

export interface StepRunnerState {
	CurrentStep: number;
	Steps: StepState[];
}

export interface RootStepCollectionState extends StepRunnerState {
	SessionKey: string;
}

export interface StepState {
	IsCompleted: boolean;
	IsVisible: boolean;
}

export abstract class StepModel<
	TSource,
	TData extends ICharacterData,
	TState extends StepState
> {
	Name: string;
	Index: number = 0;
	UpdateCharacter: (source: TSource, state: TState, newData: TData) => void;
	GetIsVisible?: ((source: TSource, data: TData) => boolean) | undefined;
	IsRequired: boolean;
	HelpComponent: JSX.Element | string | undefined;

	constructor(
		name: string,
		updateCharacter: (source: TSource, state: TState, newData: TData) => void
	) {
		this.Name = name;
		this.UpdateCharacter = updateCharacter;
		this.IsRequired = false;
	}

	abstract controlTypeId(): string;

	isRequired() {
		this.IsRequired = true;
		return this;
	}

	onlyShowWhen(
		getIsVisible: ((source: TSource, data: TData) => boolean) | undefined
	) {
		this.GetIsVisible = getIsVisible;
		return this;
	}

	withHelp(content: JSX.Element | string | undefined) {
		this.HelpComponent = content;
		return this;
	}

	abstract initializeState(): TState;

	abstract clearState(newState: TState): void;

	abstract updateStateInternal(
		source: TSource,
		data: TData,
		newState: TState
	): void;

	updateState(source: TSource, data: TData, newState: TState): void {
		newState.IsVisible = this.GetIsVisible
			? this.GetIsVisible(source, data)
			: true;
		this.updateStateInternal(source, data, newState);
	}

	abstract renderInternal(
		stepState: TState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element;

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
			//step.Container = this;
		});
	}

	initializeState(): StepRunnerState {
		return {
			CurrentStep: -1,
			Steps: this.ByIndex.map((s) => s.initializeState()),
		};
	}

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

export class RootStepCollection<
	TSource,
	TData extends ICharacterData
> extends StepRunner<TSource, TData> {
	BuilderKey: string;
	GetInitialCharacterData: () => TData;

	constructor(
		builderKey: string,
		steps: StepModel<TSource, TData, any>[],
		getInitialCharacterData: () => TData
	) {
		super("Root", steps);
		this.BuilderKey = builderKey;
		this.GetInitialCharacterData = getInitialCharacterData;
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
