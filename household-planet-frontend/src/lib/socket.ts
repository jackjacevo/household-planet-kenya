import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null

  connect() {
    // WebSocket temporarily disabled to prevent connection errors
    console.log('WebSocket connection disabled')
    return null
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  getSocket() {
    return this.socket
  }
}

const socketService = new SocketService()
export { socketService }
export default socketService