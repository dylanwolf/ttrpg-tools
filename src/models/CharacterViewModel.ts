import { action, computed, makeObservable, observable } from "mobx";
import {
	BuilderData,
	CharacterClass,
	CharacterTemplate,
	ClassSkill,
	getBuilderData,
	StartingAbilityScore,
	StartingDice,
	Weapon,
} from "../data/BuilderData";
import { StepCollection } from "./StepModel";
import { StringDropDownStepModel } from "../components/steps/StringDropDownStep";
import { AssignItemsStepModel } from "../components/steps/AssignItemsStep";
import { abilityScoreDiceRenderer } from "../components/Renderers";
import { ConditionalStepModel } from "../components/steps/ConditionalStep";
import { NumericStepModel } from "../components/steps/NumericStep";
import { adjustDiceRoll } from "../data/DiceRolls";

export class CharacterViewModel {
	@observable.shallow Builder: BuilderData | undefined;
	@observable Steps: StepCollection<CharacterViewModel>;

	constructor() {
		this.Steps = new StepCollection<CharacterViewModel>(
			[
				new NumericStepModel<CharacterViewModel>(
					"Level",
					"Level",
					(mdl) => 1,
					(mdl) => 1,
					(mdl) => 10
				),
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
					(mdl) => this.getStartingAbilityScoreOptions(),
					(itm) => itm.Name,
					(itm) => itm.Name,
					(mdl, lst) => lst[0]?.Name
				),
				new StringDropDownStepModel<CharacterViewModel, Weapon>(
					"WeaponMastery",
					"Weapon Mastery",
					(mdl) => mdl.Builder?.Weapons || [],
					(itm) => itm.Name,
					(itm) => itm.Name,
					(mdl, lst) => lst[0]?.Name
				),
				new StringDropDownStepModel<CharacterViewModel, CharacterClass>(
					"FirstClass",
					"Class",
					(mdl) => mdl.Builder?.Classes || [],
					(itm) => itm.Name,
					(itm) => itm.Name,
					(mdl, lst) => lst[0]?.Name
				),
				new ConditionalStepModel<CharacterViewModel>(
					"FirstClassSideJobConditional",
					new StringDropDownStepModel<CharacterViewModel, ClassSkill>(
						"FirstClassSideJob",
						"Side Job",
						(mdl) => this.getSideJobOptions(),
						(itm) => itm.Name,
						(itm) => itm.Name,
						(mdl, lst) => lst[0]?.Name
					),
					(mdl) => this.hasFirstClassSideJob()
				),
				new ConditionalStepModel<CharacterViewModel>(
					"FirstClassExtraMasteredWeaponConditional",
					new StringDropDownStepModel<CharacterViewModel, Weapon>(
						"FirstClassExtraMasteredWeapon",
						"Weapon Grace",
						(mdl) => this.getfirstClassExtraMasteredWeapons(),
						(itm) => itm.Name,
						(itm) => itm.Name,
						(mdl, lst) => lst[0]?.Name
					),
					(mdl) => this.getfirstClassExtraMasteredWeapons().length > 0
				),
				new AssignItemsStepModel<CharacterViewModel, StartingDice>(
					"AssignAbilityScores",
					"Assign Stats",
					(mdl) => this.getStartingDice(),
					(mdl) => this.getStartingAbilityScoreBuckets(),
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
	// Logic
	// ----------------------------------------------------------------------

	getStartingAbilityScoreOptions() {
		var currentTemplateSets =
			this.characterTemplate?.StartingAbilityScoreFilter || [];

		return (
			this.Builder?.StartingAbilityScores?.filter((x) =>
				currentTemplateSets.includes(x.Name)
			) || []
		);
	}

	getStartingDice() {
		return this.startingAbilityScores?.Dice || [];
	}

	getStartingAbilityScoreBuckets() {
		var lockedBuckets = this.startingAbilityScores?.Dice.filter(
			(d) => d.Attribute
		).map((d) => d.Attribute);

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

	hasFirstClassSideJob() {
		return this.firstClassSkills?.filter((x) => x.SelectSkill)?.length > 0
			? true
			: false;
	}

	getSideJobOptions() {
		var skillNames =
			(
				this.Steps.ByKey["FirstClass"] as StringDropDownStepModel<
					CharacterViewModel,
					CharacterClass
				>
			)?.getSelectedItem?.Skills || [];

		return (
			(this.Builder?.Skills || []).filter(
				(s) => !skillNames.includes(s.Name)
			) || []
		);
	}

	getfirstClassExtraMasteredWeapons() {
		var skills = (this.firstClassSkills || []).concat(
			this.sideJobSkill ? [this.sideJobSkill] : []
		);

		var weaponOptions =
			skills.filter((x) => x.ExtraMasteredWeapon)[0]?.ExtraMasteredWeapon || [];
		return (
			this.Builder?.Weapons.filter((x) => weaponOptions.includes(x.Name)) || []
		);
	}

	// ----------------------------------------------------------------------
	// Sidebar computeds
	// ----------------------------------------------------------------------

	@computed get characterTemplate() {
		return this.Steps.getAs<
			StringDropDownStepModel<CharacterViewModel, CharacterTemplate>
		>("CharacterTemplate")?.getSelectedItem;
	}

	@computed get startingAbilityScores() {
		return this.Steps.getAs<
			StringDropDownStepModel<CharacterViewModel, StartingAbilityScore>
		>("StartingAbilityScores")?.getSelectedItem;
	}

	@computed get firstClass() {
		return this.Steps.getAs<
			StringDropDownStepModel<CharacterViewModel, CharacterClass>
		>("FirstClass")?.getSelectedItem;
	}

	@computed get firstClassSkills() {
		var skillNames = this.firstClass?.Skills || [];

		return (this.Builder?.Skills || []).filter((s) =>
			skillNames.includes(s.Name)
		);
	}

	@computed get sideJobSkill(): ClassSkill | undefined {
		var sideJobContainer = this.Steps.getAs<
			ConditionalStepModel<CharacterViewModel>
		>("FirstClassSideJobConditional");

		if (!sideJobContainer?.IsShown) return undefined;

		var sideJobName = (
			sideJobContainer?.Child as StringDropDownStepModel<
				CharacterViewModel,
				ClassSkill
			>
		)?.Value;

		var skill =
			this.Builder?.Skills.filter((s) => s.Name === sideJobName)[0] ||
			undefined;

		if (!skill || !skill.RelevantRoll) return skill;
		return {
			Name: skill.Name,
			Description: skill.Description,
			SelectSkill: skill.SelectSkill,
			ExtraMasteredWeapon: skill.ExtraMasteredWeapon,
			RelevantRoll: adjustDiceRoll(skill.RelevantRoll, -1),
		} as ClassSkill;
	}

	@computed get allSkills() {
		return (this.firstClassSkills || []).concat(
			this.sideJobSkill ? [this.sideJobSkill] : []
		);
	}

	@computed get abilityScores() {
		return (
			this.Steps.getAs<AssignItemsStepModel<CharacterViewModel, StartingDice>>(
				"AssignAbilityScores"
			)?.Values || {}
		);
	}

	@computed get weaponMasteries(): Weapon[] {
		var baseWeaponMastery =
			this.Steps.getAs<StringDropDownStepModel<CharacterViewModel, Weapon>>(
				"WeaponMastery"
			)?.getSelectedItem;

		var firstClassExtraWeaponMastery = (
			this.Steps.getAs<ConditionalStepModel<CharacterViewModel>>(
				"FirstClassExtraMasteredWeaponConditional"
			)?.Child as StringDropDownStepModel<CharacterViewModel, Weapon>
		)?.getSelectedItem;

		return (
			[baseWeaponMastery, firstClassExtraWeaponMastery].filter(
				(x) => x
			) as Weapon[]
		)
			.groupBy((x) => x.Name)
			.map((grp) => {
				return {
					Name: grp.key,
					Examples: grp.items[0].Examples,
					Description: grp.items[0].Description,
					Accuracy: adjustDiceRoll(grp.items[0].Accuracy, grp.items.length - 1),
					Damage: grp.items[0].Damage,
				};
			});
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
