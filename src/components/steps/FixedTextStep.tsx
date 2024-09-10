import { action, computed, makeObservable, observable } from "mobx";
import { StepControlProps, StepModel } from "../../models/StepModel";
import { observer } from "mobx-react-lite";

export class FixedTextStepModel<TModel, TItem> extends StepModel<TModel> {
	@observable.shallow Value: TItem | undefined;
	@observable Label: string;
	_getValueFunc: (model: TModel) => TItem | undefined;
	_renderer: (item: TItem) => JSX.Element;

	constructor(
		name: string,
		label: string,
		getValueFunc: (model: TModel) => TItem | undefined,
		renderer: (item: TItem) => JSX.Element
	) {
		super(name);
		this.Label = label;
		this._getValueFunc = getValueFunc;
		this._renderer = renderer;
		makeObservable(this);
	}

	@computed get isCompleted(): boolean {
		return true;
	}

	@action.bound refresh(model: TModel, refreshingSelf: boolean): void {
		this.Value = this._getValueFunc(model);
	}

	@action.bound completed(model: TModel): void {}

	render(model: TModel, stepIdx: number): JSX.Element {
		return (
			<FixedTextStepControl model={model} step={this} stepIndex={stepIdx} />
		);
	}
}

const FixedTextStepControl = observer(
	<TModel, TItem>(
		props: StepControlProps<TModel, FixedTextStepModel<TModel, TItem>>
	) => {
		return (
			<div className={`step step-fixedtext step-${props.step.Name}`}>
				<div className="title">{props.step.Label}</div>
				{props.step.Value ? props.step._renderer(props.step.Value) : <></>}
			</div>
		);
	}
);
