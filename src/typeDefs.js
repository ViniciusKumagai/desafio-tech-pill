import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the schema file
export const typeDefs = readFileSync(
    join(__dirname, '../schema.graphql'),
    'utf8'
); 