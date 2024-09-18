import { StepModel, StepState } from "../../models/StepModel";
import { mergeStateWithUpdates } from "../../models/builderHelpers";

interface ContainerStepState extends StepState {
	Steps: StepState[];
}

export class ContainerStep<TSource, TData> extends StepModel<
	TSource,
	TData,
	ContainerStepState
> {
	Label: string;
	Children: StepModel<TSource, TData, any>[];
	GetIsVisible: ((src: TSource, data: TData) => boolean) | undefined;

	constructor(
		name: string,
		label: string,
		children: StepModel<TSource, TData, any>[],
		getIsVisible?: ((src: TSource, data: TData) => boolean) | undefined
	) {
		super(
			name,
			(source: TSource, state: ContainerStepState, newData: TData) => {
				this.Children.forEach((step, idx) => {
					step.UpdateCharacter(source, state.Steps[idx], newData);
				});
			}
		);
		this.Label = label;
		this.Children = children;

		children.forEach((step, idx) => {
			step.Index = idx;
		});

		this.GetIsVisible = getIsVisible;
	}

	initializeState(): ContainerStepState {
		return {
			Steps: this.Children.map((c) => c.initializeState()),
			IsCompleted: false,
			IsVisible: this.GetIsVisible ? false : true,
		};
	}

	clearState(newState: ContainerStepState) {
		this.Children.forEach((step, idx) => {
			step.clearState(newState.Steps[idx]);
		});
	}

	updateState(
		source: TSource,
		data: TData,
		newState: ContainerStepState
	): void {
		newState.IsVisible = this.GetIsVisible
			? this.GetIsVisible(source, data)
			: true;

		this.Children.forEach((step, idx) => {
			if (newState.IsVisible)
				step.updateState(source, data, newState.Steps[idx]);
			else step.clearState(newState.Steps[idx]);
		});

		newState.IsCompleted = newState.IsVisible
			? newState.Steps.all((x) => x.IsCompleted)
			: true;
	}

	render(
		stepState: ContainerStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var parentIndex = this.Index;

		function triggerChildUpdate(index: number, stepUpdates: any) {
			triggerUpdate(parentIndex, {
				Steps: stepState.Steps.map((s, idx) =>
					mergeStateWithUpdates(s, (idx === index && stepUpdates) || undefined)
				),
			});
		}

		return (
			<div className={`step step-container step-${this.Name}`}>
				<div className="title">{this.Label}</div>
				<div className="container">
					{this.Children.filter((c) => stepState.Steps[c.Index].IsVisible).map(
						(c) => (
							<div
								className="container-item"
								key={`ContainerItem-${this.Name}-${c.Name}`}
							>
								{c.render(stepState.Steps[c.Index], triggerChildUpdate)}
							</div>
						)
					)}
				</div>
			</div>
		);
	}
}
