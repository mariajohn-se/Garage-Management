import { queryView } from '../db/callProcedure';
import { LegacyUserRecord } from '../models/User';

/**
 * VERIFIED FINDING: UserTable (the table FRONTEND_SPEC_v12.md's "Legacy User Management"
 * page is built around) has exactly two columns - UID and pcName - and 0 rows in production.
 * It appears to be a machine/workstation registration table (a unique ID paired with a PC
 * name), not a "legacy user account awaiting migration" entity with email/status/date/
 * migrated-to fields as the spec assumed. There is nothing to migrate, and building a fake
 * migrate-to-new-user workflow against this shape would misrepresent what the data actually
 * is. This repository exposes the table honestly, as-is; the frontend documents the mismatch
 * rather than pretending the spec's richer concept exists. See README.md for the flag to
 * revisit with someone who knows what this table is really for.
 */
export class LegacyUserRepository {
  async list(): Promise<LegacyUserRecord[]> {
    const rows = await queryView<{ UID: string; pcName: string | null }>(
      `SELECT TOP 500 UID, pcName FROM UserTable ORDER BY UID`
    );
    return rows.map((r) => ({ uid: r.UID, pcName: r.pcName }));
  }
}

export const legacyUserRepository = new LegacyUserRepository();
