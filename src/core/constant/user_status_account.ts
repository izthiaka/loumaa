export default class UserStatusAccount {
  static getPendingStatusLibelle(): string {
    return 'PENDING';
  }

  static getActivatedStatusLibelle(): string {
    return 'ACTIVE';
  }

  static getDesactivatedStatusLibelle(): string {
    return 'DESACTIVATED';
  }

  static getBannedStatusLibelle(): string {
    return 'BANNED';
  }

  static validation = [
    UserStatusAccount.getPendingStatusLibelle(),
    UserStatusAccount.getActivatedStatusLibelle(),
    UserStatusAccount.getDesactivatedStatusLibelle(),
    UserStatusAccount.getBannedStatusLibelle(),
  ];
}
