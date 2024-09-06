import { action, computed, makeObservable, observable } from "mobx";
import { createContext } from "react";
import { BuilderData, getBuilderData } from "../data/BuilderData";
import { StatAssignmentViewModel } from "./StatAssignmentViewModel";

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
	@observable Step: AppStep = AppStep.SelectCharacterTemplate;

	// Step 1: Character Template
	@observable CharacterTemplateName: string | undefined;

	// Step 2: Starting Ability Scores
	@observable StartingAbilityScoreName: string | undefined;

	// Step 2: Stat Assignments
	@observable StatAssignmentBuckets: StatAssignmentViewModel | undefined;
	@observable STR: number | undefined;
	@observable DEX: number | undefined;
	@observable INT: number | undefined;
	@observable SPI: number | undefined;

	constructor() {
		makeObservable(this);
		this.loadBuilderData();
	}

	// ----------------------------------------------------------------------
	// Init
	// ----------------------------------------------------------------------

	@action setBuilderData(data: BuilderData) {
		this.Builder = data;
	}

	loadBuilderData() {
		getBuilderData().then((data) => {
			this.setBuilderData(data);
			this.setCharacterTemplate(this.Builder?.CharacterTemplates[0].Name || "");
		});
	}

	// ----------------------------------------------------------------------
	// Step Change Events
	// ----------------------------------------------------------------------

	// ----------------------------------------------------------------------
	// Computed
	// ----------------------------------------------------------------------

	@computed get selectedCharacterTemplate() {
		return this.Builder?.CharacterTemplates.filter(
			(t) => t.Name === this.CharacterTemplateName
		)[0];
	}

	@computed get startingAbilityScores() {
		var filter =
			this.selectedCharacterTemplate?.StartingAbilityScoreFilter || null;

		return this.Builder?.StartingAbilityScores.filter(
			(x) => !filter || filter.includes(x.Name)
		);
	}

	@computed get selectedStartingAbilityScore() {
		return (
			this.Builder?.StartingAbilityScores.filter(
				(x) => x.Name === this.StartingAbilityScoreName
			)[0] || null
		);
	}

	// ----------------------------------------------------------------------
	// Changes
	// ----------------------------------------------------------------------

	@action setStep(step: AppStep) {
		this.Step = step;
	}

	@action setCharacterTemplate(templateName: string) {
		if (templateName === this.CharacterTemplateName) return;

		this.CharacterTemplateName = templateName;
		this.Step = templateName
			? AppStep.StartingAbilityScores
			: AppStep.SelectCharacterTemplate;

		var defaultStartingAbilityScore = this.startingAbilityScores
			? this.startingAbilityScores[0]
			: undefined;

		if (defaultStartingAbilityScore) {
			this.setStartingAbilityScores(defaultStartingAbilityScore.Name);
		}

		this.StartingAbilityScoreName = defaultStartingAbilityScore?.Name || "";
	}

	@action setStartingAbilityScores(setName: string) {
		if (setName === this.StartingAbilityScoreName) return;

		this.StartingAbilityScoreName = setName;
		this.Step = setName
			? AppStep.AssignAbilityScores
			: AppStep.StartingAbilityScores;

		var selected = this.selectedStartingAbilityScore;
		if (selected) {
			this.StatAssignmentBuckets = new StatAssignmentViewModel(selected);
		}
	}
}

export const CharacterViewModelContext = createContext<CharacterViewModel>(
	new CharacterViewModel()
);
