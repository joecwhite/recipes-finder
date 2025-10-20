import Database from 'better-sqlite3';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import type { Recipe, SearchConfig, CachedRecipe } from '../../../shared/types';

const DB_PATH = './recipe-cache.db';
const RECIPE_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

let db: Database.Database;

/**
 * Initialize the SQLite database and create tables
 */
export function initializeCache(): void {
  db = new Database(DB_PATH);

  // Create recipes cache table
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query_hash TEXT UNIQUE NOT NULL,
      query TEXT NOT NULL,
      config TEXT NOT NULL,
      recipe TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      accessed_at INTEGER NOT NULL,
      access_count INTEGER DEFAULT 1
    )
  `);

  // Create index for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_query_hash ON recipes(query_hash)
  `);

  // Create index for TTL cleanup
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_created_at ON recipes(created_at)
  `);

  logger.info('Cache database initialized', { path: DB_PATH });
}

/**
 * Generate a hash for the query + config combination
 */
function generateQueryHash(query: string, config: SearchConfig): string {
  const data = JSON.stringify({ query, config });
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Get cached recipe if available and not expired
 */
export function getCachedRecipe(query: string, config: SearchConfig): Recipe | null {
  if (!db) {
    initializeCache();
  }

  const queryHash = generateQueryHash(query, config);
  const now = Date.now();

  try {
    const stmt = db.prepare(`
      SELECT recipe, created_at, access_count
      FROM recipes
      WHERE query_hash = ?
    `);

    const row = stmt.get(queryHash) as
      | { recipe: string; created_at: number; access_count: number }
      | undefined;

    if (!row) {
      logger.debug('Cache miss', { query, queryHash });
      return null;
    }

    // Check if expired
    if (now - row.created_at > RECIPE_CACHE_TTL) {
      logger.debug('Cache expired', { query, queryHash });
      deleteCachedRecipe(queryHash);
      return null;
    }

    // Update access stats
    const updateStmt = db.prepare(`
      UPDATE recipes
      SET accessed_at = ?, access_count = ?
      WHERE query_hash = ?
    `);
    updateStmt.run(now, row.access_count + 1, queryHash);

    logger.info('Cache hit', { query, queryHash, accessCount: row.access_count + 1 });

    return JSON.parse(row.recipe);
  } catch (error) {
    logger.error('Failed to get cached recipe', { error, query });
    return null;
  }
}

/**
 * Cache a recipe for future use
 */
export function cacheRecipe(query: string, config: SearchConfig, recipe: Recipe): void {
  if (!db) {
    initializeCache();
  }

  const queryHash = generateQueryHash(query, config);
  const now = Date.now();

  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO recipes (query_hash, query, config, recipe, created_at, accessed_at, access_count)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    stmt.run(queryHash, query, JSON.stringify(config), JSON.stringify(recipe), now, now);

    logger.info('Recipe cached', { query, queryHash });
  } catch (error) {
    logger.error('Failed to cache recipe', { error, query });
  }
}

/**
 * Delete a cached recipe by hash
 */
function deleteCachedRecipe(queryHash: string): void {
  try {
    const stmt = db.prepare('DELETE FROM recipes WHERE query_hash = ?');
    stmt.run(queryHash);
  } catch (error) {
    logger.error('Failed to delete cached recipe', { error, queryHash });
  }
}

/**
 * Clean up expired cache entries
 */
export function cleanupExpiredCache(): void {
  if (!db) {
    initializeCache();
  }

  const now = Date.now();
  const expirationTime = now - RECIPE_CACHE_TTL;

  try {
    const stmt = db.prepare('DELETE FROM recipes WHERE created_at < ?');
    const result = stmt.run(expirationTime);

    logger.info('Cache cleanup completed', { deletedRows: result.changes });
  } catch (error) {
    logger.error('Failed to cleanup cache', { error });
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalRecipes: number;
  oldestEntry: number;
  newestEntry: number;
} {
  if (!db) {
    initializeCache();
  }

  try {
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        MIN(created_at) as oldest,
        MAX(created_at) as newest
      FROM recipes
    `);

    const row = stmt.get() as { total: number; oldest: number; newest: number };

    return {
      totalRecipes: row.total,
      oldestEntry: row.oldest,
      newestEntry: row.newest,
    };
  } catch (error) {
    logger.error('Failed to get cache stats', { error });
    return { totalRecipes: 0, oldestEntry: 0, newestEntry: 0 };
  }
}

/**
 * Close the database connection
 */
export function closeCache(): void {
  if (db) {
    db.close();
    logger.info('Cache database closed');
  }
}
