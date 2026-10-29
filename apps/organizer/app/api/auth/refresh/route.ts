import { createRefreshRouteHandler } from "@orgatick/auth";

const handler = createRefreshRouteHandler();

export const GET = handler.GET;
export const POST = handler.POST;
