/** Shared plain-CSV parser for bulk import endpoints (Users/Customers/Suppliers) - same minimal, no-quoting format established by UserController.importUsers. */
export function parseCsv(text: string): { columns: string[]; rows: string[][] } {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const [header, ...dataLines] = lines;
  if (!header) return { columns: [], rows: [] };
  const columns = header
    .toLowerCase()
    .split(',')
    .map((c) => c.trim());
  const rows = dataLines.map((line) => line.split(',').map((c) => c.trim()));
  return { columns, rows };
}
