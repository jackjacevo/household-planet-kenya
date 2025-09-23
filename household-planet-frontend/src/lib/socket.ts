export class SocketManager {
  private static instance: SocketManager;
  
  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  connect() {
    console.log('Socket connection initiated');
  }

  disconnect() {
    console.log('Socket disconnected');
  }

  emit(event: string, data: any) {
    console.log('Socket emit:', event, data);
  }

  on(event: string, callback: (data: any) => void) {
    console.log('Socket listener added for:', event);
  }
}

export const socket = SocketManager.getInstance();
export const socketService = socket;