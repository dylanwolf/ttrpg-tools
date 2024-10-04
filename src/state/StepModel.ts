import { mergeStateWithUpdates } from "../helpers/builderHelpers";

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

  abstract clearState(newState: TState): void;

  abstract updateState(source: TSource, data: TData, newState: TState): void;

  abstract render(
    stepState: TState,
    triggerUpdate: (index: number, stepUpdates: any) => void
  ): JSX.Element;
}

export class StepRunner<TSource, TData> {
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

    console.log(
      `${this.Name} onStepUpdated(${changedStep}, ${startStep}, ${endStep})`
    );
    //console.log(state);
    //console.log(newData);

    var inCompleted = true;
    for (var idx = 0; idx < state.Steps.length; idx++) {
      var step = this.ByIndex[idx];
      console.log(
        `${this.Name} Processing step ${idx} (${startStep} - ${endStep})`
      );
      //console.log(step);

      // If no matching step, continue
      if (!step) {
        newState.Steps.push(state.Steps[idx]);
        continue;
      }

      var stepState = mergeStateWithUpdates(
        state.Steps[idx],
        (idx === changedStep && stepUpdates) || undefined
      );
      //console.log(stepState);

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

export class RootStepCollection<TSource, TData> extends StepRunner<
  TSource,
  TData
> {
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
  ) {
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
