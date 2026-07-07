/**
 * VERIFIED against the live database. Of the ~16 modules IMPLEMENTATION_PHASE4_v12.md lists,
 * only two have any real backing table: AttachmentMaster (3 rows) and AdditionalRemarks
 * (110 rows, with a resolved read view AditionalRemarksSql - note the real view name is
 * missing a "d": "Aditional", not "Additional"). Document01, DocHead, and DocumentAuditLog do
 * not exist anywhere in the schema (`Invalid object name` on direct query) - the "Documents",
 * "Document Head/Template", "DMS Module", and "Document Audit Trail" screens the spec
 * describes have no real data to bind to and were not built. See README.md.
 */
export interface Attachment {
  id: number;
  type: string | null;
  /** Free-text linkage code (e.g. an order/customer reference) - semantics unconfirmed. */
  codes: string | null;
  remarks: string | null;
  /**
   * Historical rows store an absolute local filesystem path from the original desktop app
   * (e.g. "C:\Documents and Settings\..."), which cannot be served by this web app - see
   * AttachmentRepository.ts. New uploads get a real server-relative path under /uploads.
   */
  path: string | null;
  isLegacyPath: boolean;
}

export interface AdditionalRemark {
  id: number;
  ordr: string;
  entryDate: string | null;
  remarks: string;
  // Present only via the resolved report view (AditionalRemarksSql), not the base table.
  customerName?: string | null;
  phone1?: string | null;
  vehNo?: string | null;
  engineNo?: string | null;
  staffName?: string | null;
}
