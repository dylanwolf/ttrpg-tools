import { NumericInput } from "../../../components/fields/NumericInput";
import { ICharacterData } from "../BuilderFactory";
import { StepModel, StepState } from "../StepModel";
import "./AssignPoolStep.css";

/**
 * Defines a pool that points can be assigned to within an AssignPoolStep.
 */
export interface PoolDefinition {
	Name: string;
	MaxValue?: number | undefined;
}

/**
 * Defines the state data for an AssignPoolStep.
 */
interface AssignPoolStepState extends StepState {
	TotalAvailable: number;
	Remaining: number;
	Pools: PoolDefinition[];
	Values: { [name: string]: number | null } | undefined;
}

/**
 * Creates a step in the character builder that can be used to assign points to a set of pools.
 */
export class AssignPoolStep<
	TSource,
	TData extends ICharacterData
> extends StepModel<TSource, TData, AssignPoolStepState> {
	Label: string | undefined;
	GetAvailable: ((src: TSource, data: TData) => number) | undefined;
	GetPools: ((src: TSource, data: TData) => PoolDefinition[]) | undefined;
	GetDefaultValue:
		| ((src: TSource, data: TData) => { [name: string]: number })
		| undefined;

	constructor(name: string) {
		super(name);
	}

	/**
	 * Sets a label that will be displayed when the step is rendered
	 * @param label
	 * @returns
	 */
	withLabel(label: string | undefined) {
		this.Label = label;
		return this;
	}

	/**
	 * Defines a function used to determine the number of points available to be assigned
	 * @param availableFunc
	 * @returns
	 */
	withAvailablePoints(
		availableFunc: ((src: TSource, data: TData) => number) | undefined
	) {
		this.GetAvailable = availableFunc;
		return this;
	}

	/**
	 * Defines a function used to determine which pools points can be assigned to
	 * @param poolsFunc
	 * @returns
	 */
	withStatPools(
		poolsFunc: ((src: TSource, data: TData) => PoolDefinition[]) | undefined
	) {
		this.GetPools = poolsFunc;
		return this;
	}

	/**
	 * Defines a function used to set the value when the step loads. This function should load data from existing character data if availble, or supply a value for new characters.
	 * @param defaultFunc
	 * @returns
	 */
	withDefaultValue(
		defaultFunc:
			| ((src: TSource, data: TData) => { [name: string]: number })
			| undefined
	) {
		this.GetDefaultValue = defaultFunc;
		return this;
	}

	controlTypeId(): string {
		return "assignpool";
	}

	initializeState(): AssignPoolStepState {
		return {
			TotalAvailable: 0,
			Remaining: 0,
			Pools: [],
			Values: undefined,
			IsCompleted: !this.IsRequired,
			IsVisible: this.GetIsVisible ? false : true,
		};
	}

	clearState(newState: AssignPoolStepState): void {
		newState.TotalAvailable = 0;
		newState.Pools = [];
		newState.Values = {};
	}

	updateStateInternal(
		source: TSource,
		data: TData,
		newState: AssignPoolStepState
	): void {
		if (!newState.IsVisible) {
			this.clearState(newState);
			newState.IsCompleted = true;
		} else {
			var available =
				(this.GetAvailable && this.GetAvailable(source, data)) || 0;
			var pools = (this.GetPools && this.GetPools(source, data)) || [];

			var oldValues =
				newState.Values ||
				(this.GetDefaultValue && this.GetDefaultValue(source, data)) ||
				{};

			var newValue: { [name: string]: number | null } = {};

			var remaining = available;
			pools.forEach((p) => {
				if (oldValues[p.Name] === null) {
					newValue[p.Name] = null;
					return;
				}

				var value = oldValues[p.Name] || 0;

				if (value > remaining) value = remaining;
				if (p.MaxValue !== undefined && value > p.MaxValue) value = p.MaxValue;

				newValue[p.Name] = value;
				remaining -= value;
			});

			newState.Values = newValue;
			newState.Pools = pools;
			newState.TotalAvailable = available;
			newState.Remaining = remaining;

			newState.IsCompleted = this.IsRequired ? newState.Remaining === 0 : true;
		}
	}

	renderInternal(
		stepState: AssignPoolStepState,
		triggerUpdate: (index: number, stepUpdates: any) => void
	): JSX.Element {
		var index = this.Index;

		function onChangedValue(fieldValue: number | undefined) {}

		function onChange(
			name: string,
			maxValue: number | undefined,
			fieldValue: number | undefined
		) {
			var newValues = structuredClone(stepState.Values || {});

			if (fieldValue === undefined) {
				newValues[name] = null;
				triggerUpdate(index, { Values: newValues });
			} else {
				var currentValue =
					(stepState.Values && stepState.Values[name]) || undefined;

				if (
					fieldValue >= 0 &&
					(maxValue === undefined || maxValue >= fieldValue) &&
					fieldValue - (currentValue || 0) <= stepState.Remaining
				) {
					newValues[name] = fieldValue;
					triggerUpdate(index, { Values: newValues });
				}
			}
		}

		return (
			<>
				{this.Label ? <div className="title">{this.Label}</div> : <></>}
				<div className="available">Remaining: {stepState.Remaining}</div>
				<div className="pools">
					{stepState.Pools.map((p) => (
						<div className="pool" key={`AssignPool-${this.Name}-${p.Name}`}>
							{p.Name}:{" "}
							<NumericInput
								InitialValue={stepState.Values && stepState.Values[p.Name]}
								MinValue={0}
								MaxValue={[
									p.MaxValue,
									stepState.Remaining +
										((stepState.Values && stepState.Values[p.Name]) || 0),
								]
									.filter((x) => x !== undefined)
									.max()}
								ClampInput={true}
								OnChange={function (value) {
									onChange(p.Name, p.MaxValue, value);
								}}
							/>
						</div>
					))}
				</div>
			</>
		);
	}
}
