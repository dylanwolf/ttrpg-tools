import { valueIfInList } from "../../../../helpers/builderHelpers";
import { registerBuilderModel } from "../../BuilderFactory";
import { RootStepCollection } from "../../StepModel";
import { StaticTextStep } from "../../steps/StaticTextStep";
import { StringDropDownStep } from "../../steps/StringDropDownStep";
import { StringEntryStep } from "../../steps/StringEntryStep";
import {
	CharacterState,
	getBenedictionsThroughLevel,
	getRyuujinType,
	toPdfFormFillArgs,
} from "./CharacterData";
import { RyuujinReveilSelectorStep } from "./ReveilSelector";
import { SessionAndLevelStep } from "./SessionAndLevelStep";
import {
	Artefact,
	Benediction,
	BUILDER_KEY,
	IFromSource,
	RyuujinType,
	SourceData,
} from "./SourceData";

export function isInSelectedSource<TItem extends IFromSource>(
	data: CharacterState,
	items: TItem[]
) {
	var values = data.AdditionalSources || [];
	return items.filter((x) => !x.DataSource || values.includes(x.DataSource));
}

registerBuilderModel(
	new RootStepCollection<SourceData, CharacterState>(
		BUILDER_KEY,
		[
			new StaticTextStep<SourceData, CharacterState>(
				"Credits",
				(src, data) => src.__CREDITS__
			)
				.withLabel("Credits / Legal")
				.useMarkdown(true),
			new StaticTextStep<SourceData, CharacterState>(
				"Version",
				(src, data) => src.Version
			)
				.withLabel("Character Builder Data Version")
				.onCharacterUpdate(
					(src, state, newData) => (newData.Version = src.Version)
				),

			// new ChecklistStringStep<SourceData, CharacterState, string>(
			// 	"AdditionalSources",
			// 	"Include Sources",
			// 	(src, data) => src.AdditionalSources,
			// 	(itm) => itm,
			// 	(itm) => itm,
			// 	(src, data, lst) => src.AdditionalSources,
			// 	(src, state, data) => (data.AdditionalSources = state.Values || [])
			// ).withHelp(
			// 	"Allows you to use content from books other than the core rulebook."
			// ),
			new StringEntryStep<SourceData, CharacterState>("Name")
				.withLabel("Name")
				.withDefaultValue((src, data) => data.Title || "")
				.onCharacterUpdate(
					(src, state, newData) => (newData.Title = state.Value || "")
				),
			new SessionAndLevelStep("SessionAndLevel"),
			new StringDropDownStep<SourceData, CharacterState, RyuujinType>(
				"RyuujinType"
			)
				.withLabel("Ryuujin Type")
				.withSelectList((src, data) =>
					isInSelectedSource(data, src.RyuujinTypes)
				)
				.withItemText((itm) => itm.Name)
				.withItemValue((itm) => itm.Name)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.RyuujinType, lst)
				)
				.onCharacterUpdate(
					(src, state, newData) => (newData.RyuujinType = state.Value)
				),
			new StringDropDownStep<SourceData, CharacterState, Artefact>(
				"Level1Artefact"
			)
				.withLabel("Level 1 Artefact")
				.withSelectList((src, data) => {
					var ryuujinTypeArtefacts = getRyuujinType(src, data)?.Artefacts;
					return isInSelectedSource(data, src.Artefacts).filter(
						(a) =>
							ryuujinTypeArtefacts === undefined ||
							ryuujinTypeArtefacts.includes(a.Name)
					);
				})
				.withItemText((itm) => itm.Name)
				.withItemValue((itm) => itm.Name)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.Level1Artefact, lst)
				)
				.onCharacterUpdate(
					(src, state, newData) => (newData.Level1Artefact = state.Value)
				)
				.withDetailText((itm) => itm.Description, { OnlyShowOnMobile: true }),
			new StringDropDownStep<SourceData, CharacterState, Benediction>(
				"Level2Benediction"
			)
				.withLabel("Level 2 Benediction")
				.withSelectList((src, data) => {
					var ryuujinTypeBenedictions = getRyuujinType(src, data)?.Benedictions;
					return isInSelectedSource(data, src.Benedictions).filter(
						(b) => b.IsCommon || ryuujinTypeBenedictions.includes(b.Name)
					);
				})
				.withItemText((itm) => itm.Name)
				.withItemValue((itm) => itm.Name)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.Level2Benediction, lst)
				)
				.onCharacterUpdate(
					(src, state, newData) => (newData.Level2Benediction = state.Value)
				)
				.onlyShowWhen((src, data) => data.Level >= 2)
				.withDetailText((itm) => itm.Description, { OnlyShowOnMobile: true }),
			new StringDropDownStep<SourceData, CharacterState, Benediction>(
				"Level3Benediction"
			)
				.withLabel("Level 3 Benediction")
				.withSelectList((src, data) => {
					return isInSelectedSource(data, src.Benedictions).filter(
						(b) => !getBenedictionsThroughLevel(data, 2).includes(b.Name)
					);
				})
				.withItemText((itm) => itm.Name)
				.withItemValue((itm) => itm.Name)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.Level3Benediction, lst)
				)
				.onCharacterUpdate(
					(src, state, newData) => (newData.Level3Benediction = state.Value)
				)
				.onlyShowWhen((src, data) => data.Level >= 3)
				.withHelp(
					"At level 3, the Ryuujin may select one Diverse Benediction, which can be from any list."
				)
				.withDetailText((itm) => itm.Description, { OnlyShowOnMobile: true }),
			new StringDropDownStep<SourceData, CharacterState, Benediction>(
				"Level4Benediction"
			)
				.withLabel("Level 4 Benediction")
				.withSelectList((src, data) => {
					var ryuujinTypeBenedictions = getRyuujinType(src, data)?.Benedictions;
					return isInSelectedSource(data, src.Benedictions).filter(
						(b) =>
							(b.IsCommon || ryuujinTypeBenedictions.includes(b.Name)) &&
							!getBenedictionsThroughLevel(data, 3).includes(b.Name)
					);
				})
				.withItemText((itm) => itm.Name)
				.withItemValue((itm) => itm.Name)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.Level4Benediction, lst)
				)
				.onCharacterUpdate(
					(src, state, newData) => (newData.Level4Benediction = state.Value)
				)
				.onlyShowWhen((src, data) => data.Level >= 4)
				.withDetailText((itm) => itm.Description, { OnlyShowOnMobile: true }),
			new StringDropDownStep<SourceData, CharacterState, Artefact>(
				"Level4Artefact"
			)
				.withLabel("Level 4 Artefact Gift")
				.withSelectList((src, data) => {
					var ryuujinTypeArtefacts = getRyuujinType(src, data)?.Artefacts;
					return isInSelectedSource(data, src.Artefacts).filter(
						(a) =>
							a.Name !== data.Level1Artefact &&
							!ryuujinTypeArtefacts.includes(a.Name)
					);
				})
				.withItemText((itm) => itm.Name)
				.withItemValue((itm) => itm.Name)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.Level4ArtefactGift, lst)
				)
				.onCharacterUpdate(
					(src, state, newData) => (newData.Level4ArtefactGift = state.Value)
				)
				.onlyShowWhen((src, data) => data.Level >= 4)
				.withHelp(
					"The Ryuujin's Artefact Gift comes from another Ryuujin type's artefact list."
				)
				.withDetailText((itm) => itm.Description, { OnlyShowOnMobile: true }),
			new StringDropDownStep<SourceData, CharacterState, Benediction>(
				"Level5Benediction"
			)
				.withLabel("Level 5 Benediction")
				.withSelectList((src, data) => {
					var ryuujinTypeBenedictions = getRyuujinType(src, data)?.Benedictions;
					return isInSelectedSource(data, src.Benedictions).filter(
						(b) =>
							(b.IsCommon || ryuujinTypeBenedictions.includes(b.Name)) &&
							!getBenedictionsThroughLevel(data, 4).includes(b.Name)
					);
				})
				.withItemText((itm) => itm.Name)
				.withItemValue((itm) => itm.Name)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.Level5Benediction, lst)
				)
				.onCharacterUpdate(
					(src, state, newData) => (newData.Level5Benediction = state.Value)
				)
				.onlyShowWhen((src, data) => data.Level >= 5)
				.withDetailText((itm) => itm.Description, { OnlyShowOnMobile: true }),
			new RyuujinReveilSelectorStep("Reveils"),
		],
		() => {
			return {
				Level: 1,
				AdditionalSources: [],
				Title: "New Ryuujin",
				Reveils: [],
			};
		},
		toPdfFormFillArgs
	)
);
