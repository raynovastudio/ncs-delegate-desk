//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-C6af0yrR.js
var manifest = { "8fd33fd438ad0c7d1f452b0b0bc424de3dcedd9b639131896b8d7dde9c0472b3": {
	functionName: "sendBadgeEmail_createServerFn_handler",
	importer: () => import("./_ssr/badge-email.functions-MgxBwiUH.mjs")
} };
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
