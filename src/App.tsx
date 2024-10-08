import { Provider } from "react-redux";
import React from "react";
import { store } from "./state/AppStore";
import { SiteLayoutFrame } from "./layout/SiteLayoutFrame";
import "bootswatch/dist/darkly/bootstrap.min.css";
import "./App.css";
import { Navigate, Outlet } from "react-router";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoadingPage } from "./routing/LoadingPage";
import { registerArrayHelpers } from "./helpers/arrayHelpers";

registerArrayHelpers();

/* Load models */

/* Build routes */
const LazyCharacterBuilderPage = React.lazy(
	() => import("./routing/CharacterBuilderPage")
);

const LazyAboutPage = React.lazy(() => import("./routing/AboutPage"));

const router = createBrowserRouter([
	{
		element: (
			<SiteLayoutFrame>
				<Outlet />
			</SiteLayoutFrame>
		),
		children: [
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
			{
				path: "/about",
				element: (
					<>
						<React.Suspense fallback={<LoadingPage />}>
							<LazyAboutPage />
						</React.Suspense>
					</>
				),
			},
		],
	},
]);

function App() {
	return (
		<>
			<React.StrictMode>
				<Provider store={store} stabilityCheck="never">
					<RouterProvider router={router} />
				</Provider>
			</React.StrictMode>
		</>
	);
}

export default App;
