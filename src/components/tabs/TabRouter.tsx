import React from "react";
import { useAppSelector } from "../../state/AppStore";
import { currentTabSessionSelector } from "../../state/tab-sessions/TabSessions";
import { LoadingPage } from "../../routing/LoadingPage";

const LazyCharacterBuilderView = React.lazy(
	() => import("../character-builder/CharacterBuilderView")
);
const LazyEncounterBuilder5eView = React.lazy(
	() => import("../EncounterBuilder5e")
);

export function TabContentRouter() {
	const currentTab = useAppSelector(currentTabSessionSelector());

	// TODO: Return default view if no tabs are selected or available
	if (!currentTab) return <></>;

	if (currentTab.IsBusy) return <LoadingPage />;

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
	}
}
