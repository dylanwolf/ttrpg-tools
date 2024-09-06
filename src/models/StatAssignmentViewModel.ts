import { computed, makeObservable, observable } from "mobx";
import { StartingAbilityScore, StartingDice } from "../data/BuilderData";
import { DragAndDropLinkedState } from "react-drag-drop-assignment";

export class StatAssignmentBucketModel {
	Name: string;
	@observable.shallow Dice: StartingDice[];
	IsLocked: boolean;

	@computed get isValid() {
		return this.Dice.length === 1;
	}

	constructor(name: string, dice: StartingDice[], attributeBucket: boolean) {
		this.Name = name;
		this.Dice = dice;
		this.IsLocked = attributeBucket && dice.length > 0;

		makeObservable(this);
	}
}

export class StatAssignmentViewModel {
	@observable.shallow Buckets: StatAssignmentBucketModel[];
	@observable.shallow Available: StartingDice[];
	dragAndDropState: DragAndDropLinkedState<StartingDice>;

	constructor(template: StartingAbilityScore) {
		this.Buckets = ["STR", "DEX", "INT", "SPI"].map(
			(attr) =>
				new StatAssignmentBucketModel(
					attr,
					template.Dice.filter((d) => d.Attribute === attr),
					true
				)
		);

		this.Available = template.Dice.filter((d) => !d.Attribute);

		this.dragAndDropState = new DragAndDropLinkedState<StartingDice>();

		makeObservable(this);
	}

	@computed get isValid() {
		return this.Buckets.filter((b) => b.isValid).length === 4;
	}
}
