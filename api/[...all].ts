import type { Request, Response } from 'express';
import { createBackendApp } from '../serverApp';

const app = createBackendApp();

export default function handler(req: Request, res: Response) {
  return app(req, res);
}
