import {
	StepModel,
	StepRunner,
	StepRunnerState,
	StepState,
} from "../../state/StepModel";
import { mergeStateWithUpdates } from "../../helpers/builderHelpers";

interface ContainerStepState extends StepState, StepRunnerState {
	//StepUpdated: number | undefined;
}

export class ContainerStep<TSource, TData> extends StepModel<
	TSource,
	TData,
	ContainerStepState
> {
	Label: string;
	Steps: StepRunner<TSource, TData>;
	GetIsVisible: ((src: TSource, data: TData) => boolean) | undefined;

	constructor(
		name: string,
		label: string,
		children: StepModel<TSource, TData, any>[],
		getIsVisible?: ((src: TSource, data: TData) => boolean) | undefined
	) {
		super(
			name,
			(source: TSource, state: ContainerStepState, newData: TData) => { }
		);
		this.Steps = new StepRunner<TSource, TData>(name, children);
		this.Label = label;
		this.GetIsVisible = getIsVisible;
	}

	initializeState(): ContainerStepState {
		return {
			...this.Steps.initializeState(),
			IsCompleted: false,
			IsVisible: this.GetIsVisible ? false : true,
		};
	}

	clearState(newState: ContainerStepState) {
		this.Steps.ByIndex.forEach((step, idx) => {
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

		if (newState.IsVisible) {
			var updatedState = this.Steps.onParentStepUpdated(
				source,
				data,
				newState,
				-1
			);
			newState.CurrentStep = updatedState.NewStepState.CurrentStep;
			newState.Steps = updatedState.NewStepState.Steps;
		} else {
			this.clearState(newState);
		}

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
				StepUpdated: index,
				Steps: stepState.Steps.map((s, idx) =>
					mergeStateWithUpdates(s, (idx === index && stepUpdates) || undefined)
				),
			});
		}

		return (
			<div
				className={`step step-container step-${this.Name} step-${stepState.IsCompleted ? "complete" : "incomplete"
					}`}
			>
				<div className="title">{this.Label}</div>
				<div className="container-box">
					{this.Steps.ByIndex.filter(
						(c) => stepState.Steps[c.Index].IsVisible
					).map((c) => (
						<div
							className="container-item"
							key={`ContainerItem-${this.Name}-${c.Name}`}
						>
							{c.render(stepState.Steps[c.Index], triggerChildUpdate)}
						</div>
					))}
				</div>
			</div>
		);
	}
}
