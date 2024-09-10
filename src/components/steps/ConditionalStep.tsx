import { action, computed, makeObservable, observable } from "mobx";
import { StepModel } from "../../models/StepModel";

export class ConditionalStepModel<TModel> extends StepModel<TModel> {
	@observable.shallow Child: StepModel<TModel>;
	@observable IsShown: boolean = false;
	_conditionalFunc: (mdl: TModel) => boolean;

	constructor(
		name: string,
		child: StepModel<TModel>,
		conditionalFunc: (mdl: TModel) => boolean
	) {
		super(name);
		this.Child = child;
		this._conditionalFunc = conditionalFunc;
		makeObservable(this);
	}

	@computed get isCompleted(): boolean {
		return !this.IsShown ? true : this.Child.isCompleted;
	}

	@action.bound refresh(model: TModel, refreshingSelf: boolean): void {
		this.Child.Container = this.Container;
		this.IsShown = this._conditionalFunc(model);

		if (!this.IsShown) return;
		this.Child.refresh(model, refreshingSelf);
	}

	@action.bound completed(model: TModel): void {
		if (!this.IsShown) return;
		this.Child.completed(model);
	}
	render(model: TModel, stepIdx: number): JSX.Element {
		return this.IsShown ? this.Child.render(model, stepIdx) : <></>;
	}
}
