import { i as __toESM } from "../_runtime.mjs";
import { n as CONFERENCE, r as parseQrPayload } from "./conference-bp2X8G4L.mjs";
import { t as supabase } from "./client-DVvmyL1L.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as Input, r as Label, s as useRequireTeam, t as Button } from "./useAuth-hQn8Z00g.mjs";
import { b as CameraOff, g as CircleCheck, h as CircleX, o as ScanLine, u as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as AppShell } from "./AppShell-Br4sMoSv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-ARe7E5Lg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var REGION_ID = "ncs-qr-region";
function ScanPage() {
	const { session, loading, isTeam, rolesLoaded } = useRequireTeam();
	const qc = useQueryClient();
	const [scanning, setScanning] = (0, import_react.useState)(false);
	const [state, setState] = (0, import_react.useState)({ kind: "idle" });
	const [manual, setManual] = (0, import_react.useState)("");
	const scannerRef = (0, import_react.useRef)(null);
	const busyRef = (0, import_react.useRef)(false);
	const lastRef = (0, import_react.useRef)(null);
	const recent = useQuery({
		queryKey: ["recent-check-ins"],
		enabled: !!session && isTeam,
		queryFn: async () => {
			const { data, error } = await supabase.from("check_ins").select("id, checked_in_at, participants(full_name, category, registration_code)").order("checked_in_at", { ascending: false }).limit(15);
			if (error) throw error;
			return data ?? [];
		}
	});
	async function checkIn(raw) {
		const token = parseQrPayload(raw);
		if (!token) {
			setState({
				kind: "error",
				message: "This code is not a valid conference badge."
			});
			return;
		}
		const now = Date.now();
		if (lastRef.current && lastRef.current.token === token && now - lastRef.current.at < 4e3) return;
		lastRef.current = {
			token,
			at: now
		};
		if (busyRef.current) return;
		busyRef.current = true;
		setState({ kind: "checking" });
		try {
			const { data: participant, error } = await supabase.from("participants").select("id, full_name, category, registration_code").eq("qr_token", token).maybeSingle();
			if (error) throw error;
			if (!participant) {
				setState({
					kind: "error",
					message: "Badge not recognised. Not on the participant list."
				});
				return;
			}
			const { count } = await supabase.from("check_ins").select("id", {
				count: "exact",
				head: true
			}).eq("participant_id", participant.id);
			const { error: insertError } = await supabase.from("check_ins").insert({
				participant_id: participant.id,
				checked_in_by: session?.user?.id ?? null
			});
			if (insertError) throw insertError;
			setState({
				kind: "ok",
				name: participant.full_name,
				category: participant.category,
				code: participant.registration_code,
				repeat: (count ?? 0) > 0,
				at: (/* @__PURE__ */ new Date()).toLocaleTimeString()
			});
			qc.invalidateQueries({ queryKey: ["recent-check-ins"] });
			qc.invalidateQueries({ queryKey: ["check-ins"] });
		} catch (e) {
			setState({
				kind: "error",
				message: e instanceof Error ? e.message : "Check-in failed"
			});
		} finally {
			busyRef.current = false;
		}
	}
	async function startScanner() {
		try {
			const { Html5Qrcode } = await import("../_libs/html5-qrcode.mjs").then((n) => n.t);
			const scanner = new Html5Qrcode(REGION_ID);
			scannerRef.current = {
				stop: () => scanner.stop(),
				clear: () => scanner.clear()
			};
			await scanner.start({ facingMode: "environment" }, {
				fps: 10,
				qrbox: {
					width: 260,
					height: 260
				}
			}, (decoded) => void checkIn(decoded), () => {});
			setScanning(true);
		} catch (e) {
			scannerRef.current = null;
			toast.error(e instanceof Error ? e.message : "Camera unavailable. Allow camera access and try again.");
		}
	}
	async function stopScanner() {
		const s = scannerRef.current;
		scannerRef.current = null;
		setScanning(false);
		if (s) try {
			await s.stop();
			s.clear();
		} catch {}
	}
	(0, import_react.useEffect)(() => {
		return () => {
			const s = scannerRef.current;
			scannerRef.current = null;
			if (s) s.stop().then(() => s.clear()).catch(() => {});
		};
	}, []);
	if (loading || session && !rolesLoaded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-muted-foreground" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		email: session?.user.email,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.28em] text-primary",
				children: [CONFERENCE.theme, " · Venue entrance"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-2xl font-semibold sm:text-3xl",
				children: "QR check-in scanner"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Point the camera at a delegate badge. Every scan is recorded with a timestamp."
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative aspect-square w-full bg-navy sm:aspect-video",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						id: REGION_ID,
						className: "absolute inset-0 [&_video]:size-full [&_video]:object-cover"
					}), !scanning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col items-center justify-center gap-4 text-navy-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "size-10 opacity-70" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-navy-foreground/70",
							children: "Camera is off"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 border-t border-border p-4",
					children: [scanning ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "destructive",
						onClick: () => void stopScanner(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraOff, { className: "size-4" }), " Stop camera"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => void startScanner(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "size-4" }), " Start camera"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-1 items-end gap-2",
						onSubmit: (e) => {
							e.preventDefault();
							if (!manual.trim()) return;
							checkIn(manual);
							setManual("");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "manual",
								className: "text-xs text-muted-foreground",
								children: "Manual badge code"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "manual",
								value: manual,
								onChange: (e) => setManual(e.target.value),
								placeholder: "Paste badge token"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "secondary",
							children: "Check in"
						})]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanResult, { state }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground",
						children: "Recent check-ins"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 space-y-3",
						children: [(recent.data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm text-muted-foreground",
							children: "No check-ins recorded yet."
						}), (recent.data ?? []).map((row) => {
							const p = row.participants;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: p?.full_name ?? "Unknown"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs capitalize text-muted-foreground",
									children: [
										p?.category,
										" · ",
										p?.registration_code
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "whitespace-nowrap text-xs text-muted-foreground",
									children: new Date(row.checked_in_at).toLocaleTimeString()
								})]
							}, row.id);
						})]
					})]
				})]
			})]
		})]
	});
}
function ScanResult({ state }) {
	if (state.kind === "idle") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel p-5 text-sm text-muted-foreground",
		children: "Waiting for a badge scan…"
	});
	if (state.kind === "checking") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel flex items-center gap-3 p-5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Verifying badge…"]
	});
	if (state.kind === "error") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel border-destructive/40 p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-destructive",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display font-semibold",
				children: "Check-in failed"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: state.message
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel border-success/40 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-success",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display font-semibold",
					children: state.repeat ? "Already checked in — re-entry logged" : "Checked in"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-display text-xl font-semibold",
				children: state.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm capitalize text-muted-foreground",
				children: [
					state.category,
					" · ",
					state.code
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: ["Recorded at ", state.at]
			})
		]
	});
}
//#endregion
export { ScanPage as component };
