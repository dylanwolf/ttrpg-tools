import { Fragment } from "react/jsx-runtime";
import { ICharacterData } from "../BuilderFactory";
import {
	StepModel,
	StepRunner,
	StepRunnerState,
	StepState,
} from "../StepModel";
import { mergeStateWithUpdates } from "../../../helpers/builderHelpers";

/**
 * Tracks the state of a single iteration within a ForEachStep.
 */
interface ForEachIterationState extends StepRunnerState {
	IsCompleted: boolean;
	Label: string;
}

/**
 * Tracks the state ofa a ForEachStep.
 */
interface ForEachStepState extends StepState {
	Count: number;
	Iterations: ForEachIterationState[];
}

/**
 * The character data assigned to a ForEachStep, which will be provided to its child steps.
 */
export interface IterationDataArg<
	TData extends ICharacterData,
	TIterationData extends ICharacterData
> extends ICharacterData {
	/**
	 * The character data object for this specific iteration.
	 */
	IterationData: TIterationData;
	/**
	 * The index of the iteration.
	 */
	Index: number;
	/**
	 * The parent character data object which contains the array of iteration data.
	 */
	ParentData: TData;
}

/**
 * Defines a step that will run a series of other steps, once for each iteration.
 *
 * This can be used to define a set of choices that are exactly the same (e.g., pick 4 skills, some of which come with their own choices) that all work the same way.
 */
export class ForEachStep<
	TSource,
	TData extends ICharacterData,
	TIterationData extends ICharacterData
> extends StepModel<TSource, TData, ForEachStepState> {
	GetLabel: (src: TSource, data: TIterationData, index: number) => string;
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
		getLabel: (src: TSource, data: TIterationData, index: number) => string,
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
		super(name);
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
			IsVisible: false,
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
				newState.Iterations[idx].Label = this.GetLabel(
					source,
					iterationData[idx],
					idx
				);
				newState.Iterations[idx].IsCompleted = newState.Iterations[
					idx
				].Steps.all((s) => s.IsCompleted);

				iterationData[idx] = updatedState.NewCharacterData.IterationData;
				this.SetIterationData(data, iterationData);
			}

			newState.IsVisible = newState.Iterations.any((i) =>
				i.Steps.any((s) => s.IsVisible)
			);
		}

		if (!newState.IsVisible) {
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
				{stepState.Label ? (
					<div className="title">{stepState.Label}</div>
				) : (
					<></>
				)}
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
