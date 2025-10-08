/**
 * Source types - references to files, URLs, and entities
 */

/**
 * Base class for sources displayed to users.
 */
export interface SourceBase {
  title: string;
  description?: string | null;
  timestamp?: string | null;
  group?: string | null;
}

/**
 * Source metadata for file-based references.
 */
export interface FileSource extends SourceBase {
  type: 'file';
  filename: string;
}

/**
 * Source metadata for external URLs.
 */
export interface URLSource extends SourceBase {
  type: 'url';
  url: string;
  attribution?: string | null;
}

/**
 * Source metadata for entity references.
 */
export interface EntitySource extends SourceBase {
  type: 'entity';
  id: string;
  icon?: string | null;
  preview?: 'lazy' | null;
}

/**
 * Union of supported source types.
 */
export type Source = URLSource | FileSource | EntitySource;

/**
 * Type guard for URLSource.
 */
export function isURLSource(source: Source): source is URLSource {
  return source.type === 'url';
}

/**
 * Type guard for FileSource.
 */
export function isFileSource(source: Source): source is FileSource {
  return source.type === 'file';
}

/**
 * Type guard for EntitySource.
 */
export function isEntitySource(source: Source): source is EntitySource {
  return source.type === 'entity';
}
