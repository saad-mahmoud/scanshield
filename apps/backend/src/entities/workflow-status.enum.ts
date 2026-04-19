export enum WorkflowStatus {
  Queued = 'queued',
  Processing = 'processing',
  /** Matches task wording (“completed”) */
  Completed = 'completed',
  Failed = 'failed',
}
