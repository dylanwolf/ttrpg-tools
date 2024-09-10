import { action, computed, makeObservable, observable } from "mobx";

export abstract class StepModel<TModel> {
	Name: string;
	Container: StepCollection<TModel> | undefined;

	constructor(name: string) {
		this.Name = name;
	}

	abstract get isCompleted(): boolean;
	abstract refresh(options: TModel, refreshingSelf: boolean): void;
	abstract completed(options: TModel): void;
	abstract render(model: TModel, stepIdx: number): JSX.Element;
}

export class StepCollection<TModel> {
	@observable ByIndex: StepModel<TModel>[];
	@observable ByKey: { [key: string]: StepModel<TModel> };
	Model: TModel;

	@observable Initialized = false;

	constructor(steps: StepModel<TModel>[], model: TModel) {
		this.Model = model;
		this.ByIndex = steps;
		this.ByKey = {};

		steps.forEach((step) => {
			this.ByKey[step.Name] = step;
			step.Container = this;
		});

		makeObservable(this);
	}

	@action start() {
		if (!this.Initialized) {
			this.Initialized = true;
			this.onStepProgression(-1);
		}
	}

	@computed get CurrentStep(): number {
		return !this.Initialized
			? -1
			: this.ByIndex.reduce((prev, current, idx) => {
					if (current.isCompleted) return idx + 1;
					return prev;
			  }, 0);
	}

	@action onStepProgression(changedStep: number) {
		var startStep = changedStep + 1;
		var endStep = this.CurrentStep + (changedStep === this.CurrentStep ? 1 : 0);
		console.log(`onStepProgression(${changedStep}, ${startStep}, ${endStep})`);

		if (this.ByIndex[changedStep] && this.ByIndex[changedStep].isCompleted)
			this.ByIndex[changedStep].completed(this.Model);

		for (var idx = startStep; idx <= endStep; idx++) {
			var step = this.ByIndex[idx];
			if (!step) continue;
			step.refresh(this.Model, idx === changedStep);
			if (!step.isCompleted) break;
		}
	}
}

export interface StepControlProps<TModel, TStep extends StepModel<TModel>> {
	model: TModel;
	step: TStep;
	stepIndex: number;
}
