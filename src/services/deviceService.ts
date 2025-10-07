export class DeviceService {
  private static deviceId: string | null = null;

  static getDeviceId(): string {
    if (!this.deviceId) {
      // Check if device ID exists in localStorage
      this.deviceId = localStorage.getItem('sentorial_device_id');
      
      if (!this.deviceId) {
        // Generate new device ID
        this.deviceId = this.generateDeviceId();
        localStorage.setItem('sentorial_device_id', this.deviceId);
      }
    }
    
    return this.deviceId;
  }

  private static generateDeviceId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `device_${timestamp}_${randomStr}`;
  }

  static clearDeviceId(): void {
    localStorage.removeItem('sentorial_device_id');
    this.deviceId = null;
  }
}