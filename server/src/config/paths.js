import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to server/uploads/
export const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads');
