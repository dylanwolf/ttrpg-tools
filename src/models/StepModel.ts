import { mergeStateWithUpdates } from "./builderHelpers";

export interface StepCollectionState {
	Key: string;
	CurrentStep: number;
	Steps: StepState[];
}

export interface StepState {
	IsCompleted: boolean;
	IsVisible: boolean;
}

export abstract class StepModel<TSource, TData, TState extends StepState> {
	Name: string;
	Index: number = 0;
	//Container: StepCollection<TSource, TData> | undefined;
	UpdateCharacter: (source: TSource, state: TState, newData: TData) => void;

	constructor(
		name: string,
		updateCharacter: (source: TSource, state: TState, newData: TData) => void
	) {
		this.Name = name;
		this.UpdateCharacter = updateCharacter;
	}

	abstract initializeState(): TState;

	abstract updateState(source: TSource, data: TData, newState: TState): void;

	abstract render(
		stepState: TState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element;
}

export class StepCollection<TSource, TData> {
	BuilderKey: string;
	ByIndex: StepModel<TSource, TData, any>[];
	ByKey: { [key: string]: StepModel<TSource, TData, any> } = {};
	GetInitialCharacterData: () => TData;

	constructor(
		builderKey: string,
		steps: StepModel<TSource, TData, any>[],
		getInitialCharacterData: () => TData
	) {
		this.BuilderKey = builderKey;
		this.ByIndex = steps;

		steps.forEach((step, idx) => {
			this.ByKey[step.Name] = step;
			step.Index = idx;
			//step.Container = this;
		});

		this.GetInitialCharacterData = getInitialCharacterData;
	}

	initializeState(sessionKey: string): StepCollectionState {
		return {
			Key: sessionKey,
			CurrentStep: -1,
			Steps: this.ByIndex.map((s) => s.initializeState()),
		};
	}

	getCurrentStep(state: StepCollectionState) {
		for (var idx = 0; idx < state.Steps.length; idx++) {
			if (!state.Steps[idx].IsCompleted) {
				return idx;
			}
		}
		return this.ByIndex.length;
	}

	onStepUpdated(
		source: TSource,
		data: TData,
		state: StepCollectionState,
		changedStep: number,
		stepUpdates?: any
	) {
		var newState: StepCollectionState = {
			Key: state.Key,
			Steps: [],
			CurrentStep: state.CurrentStep,
		};

		var newData = structuredClone(data);

		var startStep = changedStep;
		var endStep = startStep + 1;

		console.log(`onStepUpdated(${changedStep}, ${startStep}, ${endStep})`);
		//console.log(newData);

		var inCompleted = true;
		for (var idx = 0; idx < state.Steps.length; idx++) {
			var step = this.ByIndex[idx];
			//console.log(`Processing step ${idx} (${startStep} - ${endStep})`);

			// If no matching step, continue
			if (!step) {
				newState.Steps.push(state.Steps[idx]);
				continue;
			}

			var stepState = mergeStateWithUpdates(
				state.Steps[idx],
				(idx === changedStep && stepUpdates) || undefined
			);

			// Re-process steps that may be affected
			if (idx >= startStep && idx <= endStep) {
				step.updateState(source, newData, stepState);
				//console.log(stepState);
				//console.log(newData);
			}
			step.UpdateCharacter(source, stepState, newData);

			newState.Steps.push(stepState);

			if (inCompleted && !stepState.IsCompleted) {
				newState.CurrentStep = idx;
				inCompleted = false;
			}

			// If we finished this step, move on to the next
			if (stepState.IsCompleted && endStep <= idx) {
				endStep += 1;
			}
		}

		if (inCompleted) newState.CurrentStep = endStep;

		return {
			Key: state.Key,
			NewStepState: newState,
			NewCharacterData: newData,
		};
	}
}
