import { Fragment } from "react/jsx-runtime";
import { ICharacterData } from "../BuilderFactory";
import {
	StepModel,
	StepRunner,
	StepRunnerState,
	StepState,
} from "../StepModel";
import { mergeStateWithUpdates } from "../../../helpers/builderHelpers";

interface ForEachIterationState extends StepRunnerState {
	IsCompleted: boolean;
	Label: string;
}

interface ForEachStepState extends StepState {
	Count: number;
	Iterations: ForEachIterationState[];
}

interface IterationDataArg<
	TData extends ICharacterData,
	TIterationData extends ICharacterData
> extends ICharacterData {
	IterationData: TIterationData;
	Index: number;
	ParentData: TData;
}

export class ForEachStep<
	TSource,
	TData extends ICharacterData,
	TIterationData extends ICharacterData
> extends StepModel<TSource, TData, ForEachStepState> {
	GetLabel: (data: TIterationData, index: number) => string;
	GetCount: (src: TSource, data: TData) => number;
	GetIterationData: (data: TData) => TIterationData[];
	SetIterationData: (data: TData, newIterations: TIterationData[]) => void;
	InitIterationData: (
		source: TSource,
		data: TData,
		index: number
	) => TIterationData;
	Steps: StepRunner<TSource, IterationDataArg<TData, TIterationData>>;

	constructor(
		name: string,
		getLabel: (data: TIterationData, index: number) => string,
		getCount: (src: TSource, data: TData) => number,
		getIterationData: (data: TData) => TIterationData[],
		setIterationData: (data: TData, newIterations: TIterationData[]) => void,
		initIterationData: (
			source: TSource,
			data: TData,
			index: number
		) => TIterationData,
		children: StepModel<TSource, IterationDataArg<TData, TIterationData>, any>[]
	) {
		super(
			name,
			(source: TSource, state: ForEachStepState, newData: TData) => {}
		);
		this.GetCount = getCount;
		this.GetLabel = getLabel;
		this.GetIterationData = getIterationData;
		this.SetIterationData = setIterationData;
		this.InitIterationData = initIterationData;
		this.Steps = new StepRunner<
			TSource,
			IterationDataArg<TData, TIterationData>
		>(this.Name, children);
	}

	controlTypeId(): string {
		return "foreach";
	}

	initializeState(): ForEachStepState {
		return {
			Count: 0,
			Iterations: [],
			IsCompleted: false,
			IsVisible: this.GetIsVisible ? false : true,
		};
	}

	clearState(newState: ForEachStepState) {
		newState.Count = 0;
		newState.Iterations = [];
	}

	updateStateInternal(
		source: TSource,
		data: TData,
		newState: ForEachStepState
	) {
		if (newState.IsVisible) {
			var iterationData = this.GetIterationData(data);
			var count = this.GetCount(source, data);

			// Adjust number of iterations down
			if (count < newState.Iterations.length)
				newState.Iterations.splice(count, newState.Iterations.length - count);
			if (count < iterationData.length)
				iterationData.splice(count, iterationData.length - count);

			// Adjust number of iterations up
			if (count > newState.Iterations.length) {
				for (var idx = newState.Iterations.length; idx < count; idx++) {
					newState.Iterations.push({
						CurrentStep: -1,
						Label: "",
						Steps: this.Steps.ByIndex.map((s) => s.initializeState()),
						IsCompleted: false,
					});
				}
			}

			if (count > iterationData.length) {
				for (var idx = iterationData.length; idx <= count; idx++) {
					iterationData.push(this.InitIterationData(source, data, idx));
				}
			}

			// Process steps
			for (var idx = 0; idx < count; idx++) {
				var updatedState = this.Steps.onParentStepUpdated(
					source,
					{
						Title: "",
						IterationData: iterationData[idx],
						Index: idx,
						ParentData: data,
					},
					newState.Iterations[idx],
					-1
				);

				newState.Iterations[idx].CurrentStep =
					updatedState.NewStepState.CurrentStep;
				newState.Iterations[idx].Steps = updatedState.NewStepState.Steps;
				newState.Iterations[idx].Label = this.GetLabel(iterationData[idx], idx);
				newState.Iterations[idx].IsCompleted = newState.Iterations[
					idx
				].Steps.all((s) => s.IsCompleted);

				iterationData[idx] = updatedState.NewCharacterData.IterationData;
				this.SetIterationData(data, iterationData);
			}
		} else {
			this.clearState(newState);
			this.SetIterationData(data, []);
		}

		newState.IsCompleted = newState.IsVisible
			? newState.Iterations.all((i) => i.IsCompleted)
			: true;
	}

	render(
		stepState: ForEachStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var parentIndex = this.Index;

		function triggerIterationUpdate(
			iterationIndex: number,
			iterationUpdates: any
		) {
			triggerUpdate(parentIndex, {
				Iterations: stepState.Iterations.map((i, iIdx) =>
					mergeStateWithUpdates(i, iIdx === iterationIndex && iterationUpdates)
				),
			});
		}

		return (
			<>
				{stepState.Iterations.map((i, iIdx) => (
					<Fragment key={`ForEachIteration-${this.Name}-${iIdx}`}>
						{this.renderIteration(
							stepState.Iterations[iIdx],
							iIdx,
							triggerIterationUpdate
						)}
					</Fragment>
				))}
			</>
		);
	}

	renderInternal(
		stepState: ForEachStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		return <></>;
	}

	renderIteration(
		stepState: ForEachIterationState,
		iterationIndex: number,
		triggerUpdate: (index: number, stepUpdates: any) => void
	) {
		function triggerIterationUpdate(stepIndex: number, stepUpdates: any) {
			triggerUpdate(iterationIndex, {
				StepUpdated: stepIndex,
				Steps: stepState.Steps.map((s, idx) =>
					mergeStateWithUpdates(
						s,
						(idx === stepIndex && stepUpdates) || undefined
					)
				),
			});
		}

		return (
			<div
				className={`step step-${this.controlTypeId()}-iteration step-${
					this.Name
				}-iteration  step-${stepState.IsCompleted ? "complete" : "incomplete"}`}
			>
				<div className="title">{stepState.Label}</div>
				<div className="container-box">
					{this.Steps.ByIndex.filter(
						(c) => stepState.Steps[c.Index].IsVisible
					).map((c) => (
						<div
							className="container-item"
							key={`ContainerItem-${this.Name}-${c.Name}`}
						>
							{c.render(stepState.Steps[c.Index], triggerIterationUpdate)}
						</div>
					))}
				</div>
			</div>
		);
	}
}
