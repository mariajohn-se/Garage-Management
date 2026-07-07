import { queryView } from '../db/callProcedure';
import { Employee } from '../models/User';

/**
 * Reads from EmployeeSql per STANDARDS.md's "always read from the most-resolved view" rule.
 *
 * VERIFIED FINDING: EmployeeSql currently returns 0 rows in production even though the
 * underlying EmployeeDet table has 15 real rows. Its definition is:
 *   EmployeeDet INNER JOIN SectionSql ON EmployeeDet.SectionID = SectionSql.Ocode
 *               INNER JOIN DepartmentSql ON EmployeeDet.DeptID = DepartmentSql.Ocode
 * Every EmployeeDet row's SectionID/DeptID apparently fails to match any SectionSql/
 * DepartmentSql.Ocode, so the INNER JOINs drop everything. This is a pre-existing legacy
 * data-quality issue, not a bug introduced here - per DB-Preserve mode the view cannot be
 * altered, and hand-joining EmployeeDet directly would violate STANDARDS.md's "never
 * hand-join base tables when a view exists" rule and paper over a real data problem someone
 * should investigate. The Employee List page will therefore legitimately show "no employees
 * found" against real data until that's fixed upstream.
 */

interface EmployeeRow {
  EmpId: number;
  EmpName: string;
  NickName: string | null;
  Designation: string | null;
  Department: string | null;
  Section: string | null;
  tel1: string | null;
  telMob: string | null;
  Active: number | null;
  DOJ: string | null;
}

export class EmployeeRepository {
  async list(filters: { name?: string; department?: string; section?: string }): Promise<Employee[]> {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};
    if (filters.name) {
      conditions.push('EmpName LIKE @name');
      params.name = `%${filters.name}%`;
    }
    if (filters.department) {
      conditions.push('Department = @department');
      params.department = filters.department;
    }
    if (filters.section) {
      conditions.push('Section = @section');
      params.section = filters.section;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await queryView<EmployeeRow>(
      `SELECT TOP 500 EmpId, EmpName, NickName, Designation, Department, Section, tel1, telMob, Active, DOJ
       FROM EmployeeSql ${where}
       ORDER BY EmpName`,
      params
    );
    return rows.map((r) => ({
      empId: r.EmpId,
      name: r.EmpName,
      nickName: r.NickName,
      designation: r.Designation,
      department: r.Department,
      section: r.Section,
      tel1: r.tel1,
      telMob: r.telMob,
      isActive: (r.Active ?? 0) === 1,
      dateOfJoining: r.DOJ
    }));
  }
}

export const employeeRepository = new EmployeeRepository();
