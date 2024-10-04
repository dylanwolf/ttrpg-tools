import { Provider } from "react-redux";
import React from "react";
import { store } from "./state/AppStore";
import { SiteLayoutFrame } from "./layout/SiteLayoutFrame";
import "bootswatch/dist/darkly/bootstrap.min.css";
import "./App.css";
import { Navigate } from "react-router";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoadingPage } from "./routing/LoadingPage";
import { registerArrayHelpers } from "./helpers/arrayHelpers";

registerArrayHelpers()

// TODO: Add acknowledgement for Elderberry Inn icons if used
// TODO: Add acknowledgement for fontawesome

/* Load models */
require("./data/ryuutama/BuilderModel");
require("./data/ryuutama/CharacterSheet");

/* Build routes */
const LazyCharacterBuilderPage = React.lazy(
	() => import("./routing/CharacterBuilderPage")
);

const router = createBrowserRouter([
	{
		path: "/",
		element: <Navigate to="/builder" replace={true} />,
	},
	{
		path: "/builder",
		element: (
			<>
				<React.Suspense fallback={<LoadingPage />}>
					<LazyCharacterBuilderPage />
				</React.Suspense>
			</>
		),
	},
]);

function App() {
	return (
		<>
			<React.StrictMode>
				<Provider store={store} stabilityCheck="never">
					<SiteLayoutFrame>
						<RouterProvider router={router} />
					</SiteLayoutFrame>
				</Provider>
			</React.StrictMode>
		</>
	);
}

export default App;
