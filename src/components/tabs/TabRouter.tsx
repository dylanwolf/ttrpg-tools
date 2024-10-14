import React from "react";
import { useAppSelector } from "../../state/AppStateStorage";
import { currentTabSessionSelector } from "../../state/tab-sessions/TabSessions";
import { LoadingPage } from "../../pages/LoadingPage";
import { UtilityKey } from "../../utilities";

const LazyCharacterBuilderView = React.lazy(
	() =>
		import("../../utilities/character-builder/components/CharacterBuilderView")
);
const LazyEncounterBuilder5eView = React.lazy(
	() => import("../../utilities/encounter-builder-5e/TabControl")
);

const LazyEmptyPage = React.lazy(() => import("../../pages/BlankTab"));

export function TabContentRouter() {
	const currentTab = useAppSelector(currentTabSessionSelector());

	if (currentTab && currentTab.IsBusy) return <LoadingPage />;

	switch (currentTab?.TabType) {
		case UtilityKey.CHARACTER_BUILDER:
			return (
				<React.Suspense fallback={<LoadingPage />}>
					<LazyCharacterBuilderView />
				</React.Suspense>
			);
		case UtilityKey.ENCOUNTER_BUILDER_5E:
			return (
				<React.Suspense fallback={<LoadingPage />}>
					<LazyEncounterBuilder5eView />
				</React.Suspense>
			);
		default:
			return (
				<React.Suspense fallback={<LoadingPage />}>
					<LazyEmptyPage />
				</React.Suspense>
			);
	}
}
