import React from "react";
import { useAppSelector } from "../../state/AppStore";
import { currentTabSessionSelector } from "../../state/tab-sessions/TabSessions";
import { LoadingPage } from "../../routing/LoadingPage";

const LazyCharacterBuilderView = React.lazy(
	() => import("../character-builder/CharacterBuilderView")
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
	}
}
