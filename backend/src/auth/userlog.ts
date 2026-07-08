import { Request } from 'express';
import { userRepository } from '../repositories/UserRepository';
import { logger } from '../utils/logger';

export type UserLogAction =
  | 'Sign In'
  | 'Failed Sign In'
  | 'Sign Out'
  | 'Password Change'
  | 'Password Reset Request'
  | 'Password Reset'
  | 'Lockout'
  | 'Account Unlocked'
  | 'User Created'
  | 'User Updated'
  | 'User Deleted'
  | 'Role Changed'
  | 'Permission Granted'
  | 'Permission Revoked'
  | 'Customer Created'
  | 'Customer Updated'
  | 'Customer Deleted'
  | 'Supplier Created'
  | 'Supplier Updated'
  | 'Supplier Deleted'
  | 'Vehicle Created'
  | 'Vehicle Updated'
  | 'Vehicle Deleted'
  | 'Attachment Uploaded'
  | 'Attachment Updated'
  | 'Attachment Deleted'
  | 'Remark Added'
  | 'Remark Updated'
  | 'Remark Deleted'
  | 'Estimation Created'
  | 'Estimation Updated'
  | 'Estimation Approved'
  | 'Estimation Rejected'
  | 'Job Status Changed'
  | 'Job Assigned'
  | 'Job Status Master Created'
  | 'Job Status Master Updated'
  | 'Job Status Master Deleted'
  | 'Order Status Changed'
  | 'Order Deleted'
  | 'Local Purchase Order Deleted'
  | 'Product Request Created'
  | 'Product Request Deleted'
  | 'Vehicle Link Created'
  | 'Vehicle Link Deleted'
  | 'Order Created'
  | 'Order Updated'
  | 'Order Customer Changed'
  | 'Delivery Note Created'
  | 'Delivery Note Updated'
  | 'Local Purchase Order Created'
  | 'Local Purchase Order Updated'
  | 'Foreign Purchase Order Created'
  | 'Foreign Purchase Order Updated'
  | 'Item Updated'
  | 'Stock In Created'
  | 'Stock Out Created'
  | 'Voucher Verified'
  | 'Account Head Created'
  | 'Journal Voucher Created'
  | 'Receipt Voucher Created'
  | 'Payment Voucher Created'
  | 'Account Head Updated'
  | 'Company Header Updated';

/**
 * The live UserLog table has no separate Status column (verified via inspect-schema.js) -
 * success/failure is encoded directly in ActionName (e.g. "Failed Sign In" vs "Sign In").
 */
export async function logUserEvent(
  req: Request,
  params: { userId: number; userName: string; action: UserLogAction; remarks?: string }
): Promise<void> {
  try {
    await userRepository.writeUserLog({
      userId: params.userId,
      userName: params.userName,
      actionName: params.action,
      remarks: params.remarks,
      ipAddress: req.ip,
      machineName: req.headers['user-agent'] as string | undefined
    });
  } catch (err) {
    // Never let audit-log failures break the auth flow itself - log and continue.
    logger.error('Failed to write UserLog entry', { action: params.action, error: (err as Error).message });
  }
}
