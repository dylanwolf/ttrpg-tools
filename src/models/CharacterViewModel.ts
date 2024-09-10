import { action, makeObservable, observable } from "mobx";
import {
	BuilderData,
	CharacterTemplate,
	getBuilderData,
	StartingAbilityScore,
	StartingDice,
} from "../data/BuilderData";
import { StepCollection } from "./StepModel";
import { StringDropDownStepModel } from "../components/steps/StringDropDownStep";
import { AssignItemsStepModel } from "../components/steps/AssignItemsStep";
import { abilityScoreDiceRenderer } from "../components/AbilityScoreDiceRenderer";

export enum AppStep {
	SelectCharacterTemplate = 1,
	StartingAbilityScores = 2,
	AssignAbilityScores = 3,
	ClassChoice = 4,
	TypeChoice = 5,
	SpellChoice = 6,
}

export class CharacterViewModel {
	@observable.shallow Builder: BuilderData | undefined;
	@observable Steps: StepCollection<CharacterViewModel>;

	constructor() {
		this.Steps = new StepCollection<CharacterViewModel>(
			[
				new StringDropDownStepModel<CharacterViewModel, CharacterTemplate>(
					"CharacterTemplate",
					"Character Template",
					(mdl) => mdl.Builder?.CharacterTemplates || [],
					(itm) => itm.Name,
					(itm) => itm.Name,
					(mdl, lst) => lst[0]?.Name
				),
				new StringDropDownStepModel<CharacterViewModel, StartingAbilityScore>(
					"StartingAbilityScores",
					"Starting Stat Dice",
					this.getStartingAbilityScoreOptions,
					(itm) => itm.Name,
					(itm) => itm.Name,
					(mdl, lst) => lst[0]?.Name
				),
				new AssignItemsStepModel<CharacterViewModel, StartingDice>(
					"AssignAbilityScores",
					"Assign Stats",
					(mdl) => mdl.getStartingDice(mdl),
					(mdl) => mdl.getStartingAbilityScoreBuckets(mdl),
					(us, them) => us.Value === them.Value,
					(items, oldValue) =>
						this.buildDefaultStartingDiceValue(items, oldValue),
					abilityScoreDiceRenderer
				),
			],
			this
		);
		// TODO: Load existing character
		makeObservable(this);

		this.loadBuilderData();
	}

	// ----------------------------------------------------------------------
	// Step Filters
	// ----------------------------------------------------------------------

	getStartingAbilityScoreOptions(mdl: CharacterViewModel) {
		var currentTemplateSets =
			(
				mdl.Steps.ByKey["CharacterTemplate"] as StringDropDownStepModel<
					CharacterViewModel,
					CharacterTemplate
				>
			)?.getSelectedItem?.StartingAbilityScoreFilter || [];

		return (
			mdl.Builder?.StartingAbilityScores?.filter((x) =>
				currentTemplateSets.includes(x.Name)
			) || []
		);
	}

	getStartingDice(mdl: CharacterViewModel) {
		return (
			(
				mdl.Steps.ByKey["StartingAbilityScores"] as StringDropDownStepModel<
					CharacterViewModel,
					StartingAbilityScore
				>
			)?.getSelectedItem?.Dice || []
		);
	}

	getStartingAbilityScoreBuckets(mdl: CharacterViewModel) {
		var lockedBuckets = (
			mdl.Steps.ByKey["StartingAbilityScores"] as StringDropDownStepModel<
				CharacterViewModel,
				StartingAbilityScore
			>
		)?.getSelectedItem?.Dice.filter((d) => d.Attribute).map((d) => d.Attribute);

		return ["STR", "DEX", "INT", "SPI"].map((attr) => {
			return { Name: attr, MaxCount: 1, Locked: lockedBuckets?.includes(attr) };
		});
	}

	buildDefaultStartingDiceValue(
		items: StartingDice[],
		oldValue: { [name: string]: StartingDice[] }
	) {
		var newValue: { [name: string]: StartingDice[] } = {};

		// Set dice that start locked
		var lockedDice = items.filter((d) => d.Attribute);
		var lockedKeys = lockedDice.map((d) => d.Attribute);

		lockedDice.forEach((d) => {
			if (d.Attribute) newValue[d.Attribute] = [d];
		});

		// Set remaining values if they exist
		Object.keys(oldValue)
			.filter((key) => !lockedKeys.includes(key))
			.forEach((key) => {
				newValue[key] = [...oldValue[key]];
			});

		return newValue;
	}

	// ----------------------------------------------------------------------
	// Init
	// ----------------------------------------------------------------------

	@action.bound setBuilderData(data: BuilderData) {
		this.Builder = data;
	}

	loadBuilderData() {
		getBuilderData().then((data) => {
			this.setBuilderData(data);
			this.Steps.start();
		});
	}
}
