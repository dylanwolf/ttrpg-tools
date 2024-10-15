import { TabSavedState } from "../../helpers/JsonFileUtils";
import {
	createTabSavedState,
	createTabSessionForUtility,
	UtilityKey,
} from "../../utilities";
import { openMessageWindow } from "../modal-ui/ModalUI";

/**
 * Interface that defines an implementation of tab memory.
 */
export interface ITabMemory {
	getTabKeysFromStorage(): string[];
	updateTab(sessionKey: string, content: TabSavedState): void;
	popTab(sessionKey: string): TabSavedState | undefined;
}

/**
 * Implementation of ITabMemory using window.localStorage
 */
export class LocalStorageTabMemory implements ITabMemory {
	TAB_MEMORY_PREFIX = "TabMemory-";

	__getObject(key: string): any {
		try {
			return (
				(window.localStorage &&
					window.localStorage[key] &&
					JSON.parse(window.localStorage[key])) ||
				undefined
			);
		} catch {
			return undefined;
		}
	}

	__putObject(key: string, value: any) {
		window.localStorage[key] = JSON.stringify(value);
	}

	__deleteObject(key: string) {
		if (window.localStorage[key] !== undefined) delete window.localStorage[key];
	}

	getLocalStorageKeyFor(key: string) {
		return `${this.TAB_MEMORY_PREFIX}${key}`;
	}

	getTabKeysFromStorage(): string[] {
		return Object.keys(window.localStorage)
			.filter((key) => key.startsWith(this.TAB_MEMORY_PREFIX))
			.map((key) => key.substring(this.TAB_MEMORY_PREFIX.length));
	}

	updateTab(sessionKey: string, content: TabSavedState) {
		var key = this.getLocalStorageKeyFor(sessionKey);
		this.__putObject(key, content);
	}

	popTab(sessionKey: string) {
		var key = this.getLocalStorageKeyFor(sessionKey);
		var obj = this.__getObject(key);
		this.__deleteObject(key);
		return obj;
	}
}

/**
 * Current implementation
 */
var implementation: ITabMemory = new LocalStorageTabMemory();

/**
 * Sets the current implementation.
 * @param impl
 */
export function useImplementation(impl: ITabMemory) {
	implementation = impl;
}

/**
 * Loads tabs from storage, creating new sessions for each one.
 */
export function loadTabMemory() {
	implementation.getTabKeysFromStorage().forEach((sessionKey) => {
		var tabData = implementation.popTab(sessionKey);
		if (tabData && tabData.Utility && tabData.Data) {
			createTabSessionForUtility(tabData.Utility, tabData.Data).catch((ex) =>
				openMessageWindow(ex)
			);
		}
	});
}

/**
 * Middleware that catches changes to the Redux TabSessions slice and reflects them in tab memory
 * @param store
 * @returns
 */
export const tabSessionStorageMiddleware =
	(store: any) => (next: any) => (action: any) => {
		let result = next(action);

		if (
			["TabSessions/createTabSession", "TabSessions/updateTabSession"].includes(
				action.type
			)
		) {
			var session =
				store.getState()?.tabSessions?.Sessions[action.payload.SessionKey];
			if (session) {
				var savedState = createTabSavedState(
					session.TabType as UtilityKey,
					session.Content
				);
				if (savedState) {
					implementation.updateTab(session.SessionKey, savedState);
				}
			}
		} else if (action.type === "TabSessions/closeTabSession") {
			implementation.popTab(action.payload);
		}

		return result;
	};
