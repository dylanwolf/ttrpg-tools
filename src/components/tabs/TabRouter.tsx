import React from "react";
import { useAppSelector } from "../../state/AppStore";
import { currentTabSessionSelector } from "../../state/tab-sessions/TabSessions";
import { LoadingPage } from "../../pages/LoadingPage";

const LazyCharacterBuilderView = React.lazy(
	() => import("../character-builder/CharacterBuilderView")
);
const LazyEncounterBuilder5eView = React.lazy(
	() => import("../EncounterBuilder5e")
);

const LazyEmptyPage = React.lazy(() => import("../../pages/BlankTab"));

export function TabContentRouter() {
	const currentTab = useAppSelector(currentTabSessionSelector());

	if (currentTab && currentTab.IsBusy) return <LoadingPage />;

	switch (currentTab?.TabType) {
		case "character-builder":
			return (
				<React.Suspense fallback={<LoadingPage />}>
					<LazyCharacterBuilderView />
				</React.Suspense>
			);
		case "encounter-builder-5e":
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
