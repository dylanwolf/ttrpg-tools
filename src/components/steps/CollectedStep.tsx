import { action, computed, observable } from "mobx";
import { StepModel } from "../../models/StepModel";
import { Fragment } from "react/jsx-runtime";

export class CollectedStepModel<TModel> extends StepModel<TModel> {
	@observable.shallow Children: StepModel<TModel>[];

	constructor(name: string, children: StepModel<TModel>[]) {
		super(name);
		this.Children = children;
	}

	@computed get isCompleted(): boolean {
		var anyIncomplete = this.Children.reduce((prev, current) => {
			return prev + (current.isCompleted ? 1 : 0);
		}, 0);
		return anyIncomplete === 0;
	}

	@action.bound refresh(model: TModel, refreshingSelf: boolean): void {
		this.Children.forEach((c) => c.refresh(model, refreshingSelf));
	}
	@action.bound completed(model: TModel): void {
		this.Children.forEach((c) => c.completed(model));
	}

	render(model: TModel, stepIdx: number): JSX.Element {
		return (
			<div className={`step step-collected step-${this.Name}`}>
				{this.Children.map((c, idx) => (
					<Fragment key={`Child-${this.Name}-${idx}`}>
						{c.render(model, stepIdx)}
					</Fragment>
				))}
			</div>
		);
	}
}
