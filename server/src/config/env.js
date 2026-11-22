// Loads local .env files (server/.env first, then project-root .env).
// On Vercel there are no .env files - values come from Project Settings -> Environment Variables,
// and dotenv never overrides variables that already exist.
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../.env') });
dotenv.config({ path: path.resolve(here, '../../../.env') });
