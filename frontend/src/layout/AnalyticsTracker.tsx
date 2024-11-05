import { useEffect } from "react";

export function AnalyticsTracker() {
	useEffect(() => {
		var windowAsAny = window as any;
		if (windowAsAny._paq !== undefined) return;

		var _paq = (windowAsAny._paq = windowAsAny._paq || []);
		/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
		_paq.push(["trackPageView"]);
		_paq.push(["enableLinkTracking"]);
		return (function () {
			var u = "//matomo.dylanwolf.com/";
			_paq.push(["setTrackerUrl", u + "matomo.php"]);
			_paq.push(["setSiteId", "2"]);
			var d = document,
				g = d.createElement("script"),
				s = d.getElementsByTagName("script")[0];
			g.async = true;
			g.src = u + "matomo.js";
			s?.parentNode?.insertBefore(g, s);
		})();
	});
	return <></>;
}
