/**
 * Workflow and task types
 */

import type { FileSource, URLSource } from './sources.js';

/**
 * Base fields common to all workflow tasks.
 */
export interface BaseTask {
  /**
   * Only used when rendering the task as part of a workflow.
   * Indicates the status of the task.
   */
  status_indicator?: 'none' | 'loading' | 'complete';
}

/**
 * Workflow task displaying custom content.
 */
export interface CustomTask extends BaseTask {
  type: 'custom';
  title?: string | null;
  icon?: string | null;
  content?: string | null;
}

/**
 * Workflow task representing a web search.
 */
export interface SearchTask extends BaseTask {
  type: 'web_search';
  title?: string | null;
  title_query?: string | null;
  queries: string[];
  sources: URLSource[];
}

/**
 * Workflow task capturing assistant reasoning.
 */
export interface ThoughtTask extends BaseTask {
  type: 'thought';
  title?: string | null;
  content: string;
}

/**
 * Workflow task referencing file sources.
 */
export interface FileTask extends BaseTask {
  type: 'file';
  title?: string | null;
  sources: FileSource[];
}

/**
 * Workflow task rendering image content.
 */
export interface ImageTask extends BaseTask {
  type: 'image';
  title?: string | null;
}

/**
 * Union of workflow task variants.
 */
export type Task = CustomTask | SearchTask | ThoughtTask | FileTask | ImageTask;

/**
 * Custom summary for a workflow.
 */
export interface CustomSummary {
  title: string;
  icon?: string | null;
}

/**
 * Summary providing total workflow duration.
 */
export interface DurationSummary {
  /**
   * The duration of the workflow in seconds
   */
  duration: number;
}

/**
 * Summary variants available for workflows.
 */
export type WorkflowSummary = CustomSummary | DurationSummary;

/**
 * Workflow attached to a thread with optional summary.
 */
export interface Workflow {
  type: 'custom' | 'reasoning';
  tasks: Task[];
  summary?: WorkflowSummary | null;
  expanded: boolean;
}

/**
 * Type guard for CustomTask.
 */
export function isCustomTask(task: Task): task is CustomTask {
  return task.type === 'custom';
}

/**
 * Type guard for SearchTask.
 */
export function isSearchTask(task: Task): task is SearchTask {
  return task.type === 'web_search';
}

/**
 * Type guard for ThoughtTask.
 */
export function isThoughtTask(task: Task): task is ThoughtTask {
  return task.type === 'thought';
}

/**
 * Type guard for FileTask.
 */
export function isFileTask(task: Task): task is FileTask {
  return task.type === 'file';
}

/**
 * Type guard for ImageTask.
 */
export function isImageTask(task: Task): task is ImageTask {
  return task.type === 'image';
}
