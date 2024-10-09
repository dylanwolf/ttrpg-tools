import { Provider } from "react-redux";
import React from "react";
import { store } from "./state/AppStore";
import { SiteLayoutFrame } from "./layout/SiteLayoutFrame";
import "bootswatch/dist/darkly/bootstrap.min.css";
import "./App.css";
import { Outlet } from "react-router";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoadingPage } from "./routing/LoadingPage";
import { registerArrayHelpers } from "./helpers/arrayHelpers";

//(window as any).__DEBUG__ = true;

registerArrayHelpers();

/* Build routes */
const LazyTabSessionsPage = React.lazy(
	() => import("./routing/TabSessionsPage")
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
				element: (
					<React.Suspense fallback={<LoadingPage />}>
						<LazyTabSessionsPage />
					</React.Suspense>
				),
			},
			{
				path: "/about",
				element: (
					<React.Suspense fallback={<LoadingPage />}>
						<LazyAboutPage />
					</React.Suspense>
				),
			},
			{
				path: "/loading-test",
				element: <LoadingPage />,
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
