import {
	ensureIntegerEntry,
	ensureIntegerPaste,
	getNumericFieldValueFrom,
	toNumericFieldValue,
} from "../../../helpers/fieldHelpers";
import { ICharacterData } from "../BuilderFactory";
import { StepModel, StepState } from "../StepModel";
import "./AssignPoolStep.css";

export interface PoolDefinition {
	Name: string;
	MaxValue?: number | undefined;
}

interface AssignPoolStepState extends StepState {
	TotalAvailable: number;
	Remaining: number;
	Pools: PoolDefinition[];
	Values: { [name: string]: number | null } | undefined;
}

export function removeNullValues(values: { [name: string]: number | null }) {
	var result: { [name: string]: number } = {};

	Object.keys(values).forEach((key) => {
		result[key] = values[key] || 0;
	});

	return result;
}

export class AssignPoolStep<
	TSource,
	TData extends ICharacterData
> extends StepModel<TSource, TData, AssignPoolStepState> {
	Label: string;
	GetAvailable: (src: TSource, data: TData) => number;
	GetPools: (src: TSource, data: TData) => PoolDefinition[];
	GetDefaultValue: (src: TSource, data: TData) => { [name: string]: number };

	constructor(
		name: string,
		label: string,
		getAvailable: (src: TSource, data: TData) => number,
		getPools: (src: TSource, data: TData) => PoolDefinition[],
		getDefaultValue: (src: TSource, data: TData) => { [name: string]: number },
		updateCharacter: (
			source: TSource,
			state: AssignPoolStepState,
			newData: TData
		) => void
	) {
		super(name, updateCharacter);
		this.Label = label;
		this.GetAvailable = getAvailable;
		this.GetPools = getPools;
		this.GetDefaultValue = getDefaultValue;
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
			var available = this.GetAvailable(source, data);
			var pools = this.GetPools(source, data);

			var oldValues =
				newState.Values || this.GetDefaultValue(source, data) || {};

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

		function onChange(
			name: string,
			maxValue: number | undefined,
			evt: React.ChangeEvent<HTMLInputElement>
		) {
			var fieldValue = getNumericFieldValueFrom(evt);
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
				<div className="available">Available: {stepState.Remaining}</div>
				<div className="pools">
					{stepState.Pools.map((p) => (
						<div className="pool" key={`AssignPool-${this.Name}-${p.Name}`}>
							{p.Name}:{" "}
							<input
								type="number"
								value={toNumericFieldValue(
									stepState.Values && stepState.Values[p.Name]
								)}
								onChange={function (e) {
									onChange(p.Name, p.MaxValue, e);
								}}
								onKeyDown={ensureIntegerEntry}
								onPaste={ensureIntegerPaste}
								min={0}
								max={p.MaxValue}
							/>
						</div>
					))}
				</div>
			</>
		);
	}
}
