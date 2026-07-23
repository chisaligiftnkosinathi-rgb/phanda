import type { WorkspaceSnapshotSchema } from './workspaceSnapshotSchema';
import type { WorkspaceSummarySchema } from './workspaceSummarySchema';

export interface WorkspaceSchema {
  priority: string;
  snapshot: WorkspaceSnapshotSchema;
  summary: WorkspaceSummarySchema;
}
