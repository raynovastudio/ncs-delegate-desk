import { n as CONFERENCE } from "./conference-bp2X8G4L.mjs";
import { g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as signOut, i as cn, t as Button } from "./useAuth-hQn8Z00g.mjs";
import { f as LayoutDashboard, l as LogOut, o as ScanLine, p as HeartPulse } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-Br4sMoSv.js
var import_jsx_runtime = require_jsx_runtime();
var NAV = [{
	to: "/",
	label: "Dashboard",
	icon: LayoutDashboard
}, {
	to: "/scan",
	label: "Scan & check-in",
	icon: ScanLine
}];
function AppShell({ children, email }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "surface-navy grid-lines sticky top-0 z-40 border-b border-sidebar-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-10 items-center justify-center rounded-xl bg-navy-foreground/10 ring-1 ring-navy-foreground/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, { className: "size-5 text-navy-foreground" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "leading-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-display text-sm font-semibold tracking-tight text-navy-foreground",
							children: CONFERENCE.society
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-[11px] uppercase tracking-[0.18em] text-navy-foreground/60",
							children: [CONFERENCE.theme, " · Delegate desk"]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex items-center gap-1 rounded-full bg-navy-foreground/10 p-1",
						children: NAV.map((item) => {
							const active = pathname === item.to;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors", active ? "bg-navy-foreground text-navy" : "text-navy-foreground/75 hover:text-navy-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: item.label
								})]
							}, item.to);
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => void signOut(),
						className: "text-navy-foreground/75 hover:bg-navy-foreground/10 hover:text-navy-foreground",
						title: email ?? void 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden lg:inline",
							children: "Sign out"
						})]
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8",
			children
		})]
	});
}
//#endregion
export { AppShell as t };
