export default class UserStatusAccount {
  static getPendingStatusLibelle(): string {
    return 'PENDING';
  }

  static getActivatedStatusLibelle(): string {
    return 'ACTIVE';
  }

  static getDeActivatedStatusLibelle(): string {
    return 'DEACTIVATED';
  }

  static getBannedStatusLibelle(): string {
    return 'BANNED';
  }

  static validation = [
    UserStatusAccount.getPendingStatusLibelle(),
    UserStatusAccount.getActivatedStatusLibelle(),
    UserStatusAccount.getDeActivatedStatusLibelle(),
    UserStatusAccount.getBannedStatusLibelle(),
  ];
}
