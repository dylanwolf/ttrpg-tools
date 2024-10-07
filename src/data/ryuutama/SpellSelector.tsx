import { StepModel, StepState } from "../../state/StepModel";
import { isInSelectedSource } from "./BuilderModel";
import { CharacterState, getLevel1Type, getLevel6Type } from "./CharacterData";
import { IncantationSpell, SourceData, SpellGrouping } from "./SourceData";

interface SpellSelectorState extends StepState {
    SelectList: IncantationSpell[];
    LowLevelChoices: number;
    MidLevelChoices: number;
    HighLevelChoices: number;
    Selected: string[] | undefined;
}

export class RyuutamaSpellSelectorStep extends StepModel<
    SourceData,
    CharacterState,
    SpellSelectorState
> {
    constructor(name: string) {
        super(name, (src, state, data) => (data.SelectedSpells = state.Selected));
    }

    controlTypeId(): string {
        return 'ryuutama-spell-selector'
    }

    initializeState(): SpellSelectorState {
        return {
            SelectList: [],
            LowLevelChoices: 0,
            MidLevelChoices: 0,
            HighLevelChoices: 0,
            Selected: undefined,
            IsCompleted: true,
            IsVisible: true,
        };
    }

    clearState(newState: SpellSelectorState): void {
        newState.SelectList = [];
        newState.LowLevelChoices = 0;
        newState.MidLevelChoices = 0;
        newState.HighLevelChoices = 0;
        newState.Selected = [];
    }

    updateStateInternal(
        source: SourceData,
        data: CharacterState,
        newState: SpellSelectorState
    ): void {
        var level1Type = getLevel1Type(source, data);
        var level6Type = getLevel6Type(source, data);

        var remainingLow = 0;
        var remainingMid = 0;
        var remainingHigh = 0;

        if (level1Type.SpellsPerLevel || level6Type?.SpellsPerLevel) {
            for (var lvl = 1; lvl <= data.Level; lvl++) {
                if (lvl < 4) {
                    remainingLow += level1Type.SpellsPerLevel || 0;
                } else if (lvl < 6) {
                    remainingMid += level1Type.SpellsPerLevel || 0;
                } else if (lvl < 7) {
                    remainingMid +=
                        (level1Type.SpellsPerLevel || 0) +
                        (level6Type?.SpellsPerLevel || 0);
                } else {
                    remainingHigh +=
                        (level1Type.SpellsPerLevel || 0) +
                        (level6Type?.SpellsPerLevel || 0);
                }
            }
        }

        if (remainingLow + remainingMid + remainingHigh > 0) {
            newState.SelectList = isInSelectedSource(data, source.IncantationSpells);

            var priorSelected =
                (newState.Selected === undefined
                    ? data.SelectedSpells
                    : newState.Selected) || [];
            var currentSelected: string[] = [];

            var highSpells = source.IncantationSpells.filter(
                (x) => x.Level === SpellGrouping.High && priorSelected.includes(x.Name)
            );
            highSpells.forEach((spell) => {
                if (remainingHigh > 0) {
                    currentSelected.push(spell.Name);
                    remainingHigh--;
                }
            });

            var midSpells = source.IncantationSpells.filter(
                (x) => x.Level === SpellGrouping.Mid && priorSelected.includes(x.Name)
            );
            midSpells.forEach((spell) => {
                if (remainingMid > 0) {
                    currentSelected.push(spell.Name);
                    remainingMid--;
                } else if (remainingHigh > 0) {
                    currentSelected.push(spell.Name);
                    remainingHigh--;
                }
            });

            var lowSpells = source.IncantationSpells.filter(
                (x) => x.Level === SpellGrouping.Low && priorSelected.includes(x.Name)
            );
            lowSpells.forEach((spell) => {
                if (remainingLow > 0) {
                    currentSelected.push(spell.Name);
                    remainingLow--;
                } else if (remainingMid > 0) {
                    currentSelected.push(spell.Name);
                    remainingMid--;
                } else if (remainingHigh > 0) {
                    currentSelected.push(spell.Name);
                    remainingHigh--;
                }
            });

            newState.LowLevelChoices = remainingLow;
            newState.MidLevelChoices = remainingMid;
            newState.HighLevelChoices = remainingHigh;

            newState.Selected = currentSelected;
            newState.IsCompleted = true;
            newState.IsVisible = true;
        } else {
            this.clearState(newState);
            newState.IsCompleted = true;
            newState.IsVisible = false;
        }
    }

    renderInternal(
        stepState: SpellSelectorState,
        triggerUpdate: (index: number, stepUpdates: any) => void
    ): JSX.Element {
        var index = this.Index;

        function onChange(spell: IncantationSpell) {
            var newValues = stepState.Selected || [];

            if (newValues.includes(spell.Name)) {
                newValues = newValues.filter((x) => x !== spell.Name);
            } else if (isValidAddition(spell, stepState)) {
                newValues = newValues.concat(spell.Name);
            } else {
                return;
            }

            triggerUpdate(index, { Selected: newValues });
        }

        return (
            <>
                <div className="title">Incantation Spells</div>
                <div className="available">
                    {stepState.LowLevelChoices > 0 ? (
                        <div className="level">Low Level: {stepState.LowLevelChoices}</div>
                    ) : (
                        <></>
                    )}
                    {stepState.MidLevelChoices > 0 ? (
                        <div className="level">Mid Level: {stepState.MidLevelChoices}</div>
                    ) : (
                        <></>
                    )}
                    {stepState.HighLevelChoices > 0 ? (
                        <div className="level">
                            High Level: {stepState.HighLevelChoices}
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>&nbsp;</th>
                            <th>Name</th>
                            <th>Level</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stepState.SelectList.map((spell) => (
                            <tr key={`RyuutamaSpellSelector-${this.Name}-${spell.Name}`}>
                                <td>
                                    <input
                                        type="checkbox"
                                        value={spell.Name}
                                        disabled={isDisabledSelection(spell, stepState)}
                                        checked={(stepState.Selected || []).includes(spell.Name)}
                                        onChange={function () {
                                            onChange(spell);
                                        }}
                                    />
                                </td>
                                <td>{spell.Name}</td>
                                <td>{spell.Level}</td>
                                <td>{spell.SpellType}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        );
    }
}

function isValidAddition(spell: IncantationSpell, state: SpellSelectorState) {
    return (
        (spell.Level === SpellGrouping.Low &&
            state.LowLevelChoices + state.MidLevelChoices + state.HighLevelChoices >
            0) ||
        (spell.Level === SpellGrouping.Mid &&
            state.MidLevelChoices + state.HighLevelChoices > 0) ||
        (spell.Level === SpellGrouping.High && state.HighLevelChoices > 0)
    );
}

function isDisabledSelection(
    spell: IncantationSpell,
    state: SpellSelectorState
) {
    if (state.Selected?.includes(spell.Name)) return false;
    return !isValidAddition(spell, state);
}
