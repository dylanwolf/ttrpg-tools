import { action, computed, makeObservable, observable } from "mobx";

export abstract class StepModel<TModel> {
	Name: string;
	Container: StepCollection<TModel> | undefined;

	@computed get isVisible() {
		var idx = this.Container?.ByIndex?.indexOf(this) || 0;
		return idx <= (this.Container?.CurrentStep || -1);
	}

	constructor(name: string) {
		this.Name = name;
	}

	abstract get isCompleted(): boolean;
	abstract refresh(model: TModel, refreshingSelf: boolean): void;
	abstract completed(model: TModel): void;
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
		if (!this.Initialized) return -1;

		for (var i = 0; i < this.ByIndex.length; i++) {
			if (!this.ByIndex[i].isCompleted) return i;
		}
		return this.ByIndex.length;
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

	getAs<TStep extends StepModel<TModel>>(name: string) {
		var step = this.ByKey[name];
		if (!step) return undefined;
		return step as TStep;
	}
}

export interface StepControlProps<TModel, TStep extends StepModel<TModel>> {
	model: TModel;
	step: TStep;
	stepIndex: number;
}
