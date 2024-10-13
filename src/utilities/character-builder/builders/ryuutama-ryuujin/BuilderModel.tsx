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
				"Version",
				"Character Builder Data Version",
				false,
				(src, data) => src.Version,
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
			new StringEntryStep<SourceData, CharacterState>(
				"Name",
				"Name",
				(src, data) => data.Title || "",
				(src, state, newData) => (newData.Title = state.Value || "")
			),
			new SessionAndLevelStep("SessionAndLevel"),
			new StringDropDownStep<SourceData, CharacterState, RyuujinType>(
				"RyuujinType",
				"Ryuujin Type",
				(src, data) => isInSelectedSource(data, src.RyuujinTypes),
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.RyuujinType, lst),
				(src, state, newData) => (newData.RyuujinType = state.Value)
			),
			new StringDropDownStep<SourceData, CharacterState, Artefact>(
				"Level1Artefact",
				"Level 1 Artefact",
				(src, data) => {
					var ryuujinTypeArtefacts = getRyuujinType(src, data)?.Artefacts;
					return isInSelectedSource(data, src.Artefacts).filter(
						(a) =>
							ryuujinTypeArtefacts === undefined ||
							ryuujinTypeArtefacts.includes(a.Name)
					);
				},
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.Level1Artefact, lst),
				(src, state, newData) => (newData.Level1Artefact = state.Value)
			).withDetailText((itm) => itm.Description, { OnlyShowOnMobile: true }),
			new StringDropDownStep<SourceData, CharacterState, Benediction>(
				"Level2Benediction",
				"Level 2 Benediction",
				(src, data) => {
					var ryuujinTypeBenedictions = getRyuujinType(src, data)?.Benedictions;
					return isInSelectedSource(data, src.Benedictions).filter(
						(b) => b.IsCommon || ryuujinTypeBenedictions.includes(b.Name)
					);
				},
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.Level2Benediction, lst),
				(src, state, newData) => (newData.Level2Benediction = state.Value)
			)
				.onlyShowWhen((src, data) => data.Level >= 2)
				.withDetailText((itm) => itm.Description, { OnlyShowOnMobile: true }),
			new StringDropDownStep<SourceData, CharacterState, Benediction>(
				"Level3Benediction",
				"Level 3 Benediction",
				(src, data) => {
					return isInSelectedSource(data, src.Benedictions).filter(
						(b) => !getBenedictionsThroughLevel(data, 2).includes(b.Name)
					);
				},
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.Level3Benediction, lst),
				(src, state, newData) => (newData.Level3Benediction = state.Value)
			)
				.onlyShowWhen((src, data) => data.Level >= 3)
				.withHelp(
					"At level 3, the Ryuujin may select one Diverse Benediction, which can be from any list."
				)
				.withDetailText((itm) => itm.Description, { OnlyShowOnMobile: true }),
			new StringDropDownStep<SourceData, CharacterState, Benediction>(
				"Level4Benediction",
				"Level 4 Benediction",
				(src, data) => {
					var ryuujinTypeBenedictions = getRyuujinType(src, data)?.Benedictions;
					return isInSelectedSource(data, src.Benedictions).filter(
						(b) =>
							(b.IsCommon || ryuujinTypeBenedictions.includes(b.Name)) &&
							!getBenedictionsThroughLevel(data, 3).includes(b.Name)
					);
				},
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.Level4Benediction, lst),
				(src, state, newData) => (newData.Level2Benediction = state.Value)
			)
				.onlyShowWhen((src, data) => data.Level >= 4)
				.withDetailText((itm) => itm.Description, { OnlyShowOnMobile: true }),
			new StringDropDownStep<SourceData, CharacterState, Artefact>(
				"Level4Artefact",
				"Level 4 Artefact Gift",
				(src, data) => {
					var ryuujinTypeArtefacts = getRyuujinType(src, data)?.Artefacts;
					return isInSelectedSource(data, src.Artefacts).filter(
						(a) =>
							a.Name !== data.Level1Artefact &&
							!ryuujinTypeArtefacts.includes(a.Name)
					);
				},
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.Level4ArtefactGift, lst),
				(src, state, newData) => (newData.Level4ArtefactGift = state.Value)
			)
				.onlyShowWhen((src, data) => data.Level >= 4)
				.withHelp(
					"The Ryuujin's Artefact Gift comes from another Ryuujin type's artefact list."
				)
				.withDetailText((itm) => itm.Description, { OnlyShowOnMobile: true }),
			new StringDropDownStep<SourceData, CharacterState, Benediction>(
				"Level5Benediction",
				"Level 5 Benediction",
				(src, data) => {
					var ryuujinTypeBenedictions = getRyuujinType(src, data)?.Benedictions;
					return isInSelectedSource(data, src.Benedictions).filter(
						(b) =>
							(b.IsCommon || ryuujinTypeBenedictions.includes(b.Name)) &&
							!getBenedictionsThroughLevel(data, 4).includes(b.Name)
					);
				},
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.Level5Benediction, lst),
				(src, state, newData) => (newData.Level5Benediction = state.Value)
			)
				.onlyShowWhen((src, data) => data.Level >= 5)
				.withDetailText((itm) => itm.Description, { OnlyShowOnMobile: true }),
			new RyuujinReveilSelectorStep("Reveils"),
		],
		() => {
			return {
				Level: 5,
				AdditionalSources: [],
				Title: "New Ryuujin",
				Reveils: [],
			};
		}
	)
);
