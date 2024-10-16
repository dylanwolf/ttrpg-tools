import {
	StepModel,
	StepRunner,
	StepRunnerState,
	StepState,
} from "../StepModel";
import { mergeStateWithUpdates } from "../../../helpers/builderHelpers";
import { ICharacterData } from "../BuilderFactory";

export interface ContainerStepState extends StepState, StepRunnerState {}

export class ContainerStep<
	TSource,
	TData extends ICharacterData
> extends StepModel<TSource, TData, ContainerStepState> {
	Label: string;
	Steps: StepRunner<TSource, TData>;

	constructor(
		name: string,
		label: string,
		children: StepModel<TSource, TData, any>[]
	) {
		super(
			name,
			(source: TSource, state: ContainerStepState, newData: TData) => {}
		);
		this.Steps = new StepRunner<TSource, TData>(name, children);
		this.Label = label;
	}

	controlTypeId(): string {
		return "container";
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

	updateStateInternal(
		source: TSource,
		data: TData,
		newState: ContainerStepState
	): void {
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
			this.Steps.ByIndex.forEach((step, idx) => {
				step.UpdateCharacter(source, newState, data);
			});
		}

		newState.IsCompleted = newState.IsVisible
			? newState.Steps.all((x) => x.IsCompleted)
			: true;
	}

	renderInternal(
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
			<>
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
			</>
		);
	}
}
