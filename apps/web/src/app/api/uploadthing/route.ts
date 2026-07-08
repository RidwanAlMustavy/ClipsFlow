import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

import { NextRequest } from "next/server";

const handler = createRouteHandler({
  router: ourFileRouter,
  config: {
    isDev: process.env.NODE_ENV === "development",
  }
});

export const GET = handler.GET;

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    // Clone headers and rewrite host to localhost so Uploadthing accepts the dev-mode webhook simulation
    const headers = new Headers(req.headers);
    headers.set("host", "localhost:3000");
    
    // Create a new URL forcing localhost
    const url = new URL(req.url);
    url.hostname = "localhost";
    
    // Pass the modified request to uploadthing
    const modifiedReq = new Request(url.toString(), {
      method: req.method,
      headers: headers,
      body: req.body,
      duplex: "half",
    } as any);
    
    return handler.POST(modifiedReq as NextRequest);
  }
  
  return handler.POST(req);
}
