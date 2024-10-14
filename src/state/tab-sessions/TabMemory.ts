import { TabSavedState } from "../../helpers/JsonFileUtils";
import {
	createTabSavedState,
	createTabSessionForUtility,
	UtilityKey,
} from "../../utilities";
import { store } from "../AppStateStorage";
import { TabSessionStateCollection } from "./TabSessionSlice";

export interface TabMemory {
	Tabs: TabSavedState[];
}

export interface ITabMemory {
	save: (memory: TabMemory) => void;
	load: () => TabMemory;
}

const TAB_MEMORY_KEY = "ttrpgtools-tabs";

class LocalStorageTabMemory implements ITabMemory {
	save(memory: TabMemory) {
		window.localStorage[TAB_MEMORY_KEY] = JSON.stringify(memory);
	}

	load() {
		var json = window.localStorage[TAB_MEMORY_KEY];
		if (json) {
			try {
				return JSON.parse(json);
			} catch {}
		}
		return undefined;
	}
}

var implementation: ITabMemory = new LocalStorageTabMemory();

export function useImplementation(impl: ITabMemory) {
	implementation = impl;
}

export function loadTabMemory() {
	(implementation.load()?.Tabs || []).forEach((tab) =>
		createTabSessionForUtility(tab.Utility, tab.Data)
	);
}

export function saveTabMemory(sessions: any) {
	if (sessions) {
		implementation.save({
			Tabs: Object.values(sessions)
				.map((tab: any) => {
					return createTabSavedState(tab.TabType as UtilityKey, tab.Content);
				})
				.filter((savedState) => savedState) as TabSavedState[],
		});
	}
}
