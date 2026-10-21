import type { Express } from "express";
import { bootstrap } from "./app.bootstrap";

let appPromise: Promise<Express> | null = null;

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    appPromise = bootstrap();
  }
  const app = await appPromise;
  return app(req, res);
}
