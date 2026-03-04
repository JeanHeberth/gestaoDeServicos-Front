import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<any>();

  /**
   * Connects to the WebSocket server at the specified URL.
   * @param url The URL of the WebSocket server.
   */
  connect(url: string): void {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageSubject.next(data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * Disconnects from the WebSocket server.
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Returns an observable that emits messages received from the WebSocket server.
   */
  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }
}
