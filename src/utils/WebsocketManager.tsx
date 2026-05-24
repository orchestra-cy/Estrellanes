interface WebSocketConfig {
  url: string;
  debug?: boolean;
  heartbeatInterval?: number;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: { [key: string]: Function[] } = {};
  // private userId: number | null = null;
  private token: string | null = null;
  private config: WebSocketConfig;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];
  private shouldReconnect = true;

  constructor(config: WebSocketConfig) {
    this.config = {
      debug: false,
      heartbeatInterval: 30000,
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      ...config,
    };
    this.url = config.url;
  }

  connect(authToken: string) {
    this.token = authToken;
    this.shouldReconnect = true;
    this.log(`Attempting to connect to: ${this.url}`);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.log('✓ Connected to WebSocket server');

        const authData = {
          type: 'auth',
          token: this.token,
        };
        this.ws!.send(JSON.stringify(authData));
        this.log(`Sending auth message with token`);

        this.reconnectAttempts = 0;
        this.emit('connected');

        this.startHeartbeat();

        this.flushMessageQueue();
      };

      this.ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          this.log('Received message:', data);

          if (data.type === 'notification') {
            this.emit('notification', data.payload);
          } else {
            this.emit(data.type, data);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      this.ws.onerror = error => {
        // console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        this.log('WebSocket disconnected');
        this.stopHeartbeat();
        this.emit('disconnected');
        if (this.shouldReconnect) {
          this.attemptReconnect();
        } else {
          this.log('Reconnect disabled');
        }
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.attemptReconnect();
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.log('Sending heartbeat ping...');
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect() {
    if (!this.shouldReconnect) {
      this.log('Reconnect disabled');
      return;
    }
    if (!this.token) {
      this.log('No token available for reconnect');
      return;
    }
    if (this.reconnectAttempts < this.config.reconnectAttempts!) {
      this.reconnectAttempts++;
      const delay = this.config.reconnectDelay! * this.reconnectAttempts;
      this.log(
        `Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`,
      );
      setTimeout(() => {
        if (this.token && this.shouldReconnect) {
          this.connect(this.token);
        }
      }, delay);
    } else {
      this.log('Max reconnect attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message.type, message.payload);
    }
  }

  private log(message: string, data?: any) {
    if (this.config.debug) {
      console.log(`[WebSocketManager] ${message}`, data || '');
    }
  }

  on(eventName: string, callback: Function) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);

    // Return unsubscribe function to prevent memory leaks
    return () => {
      this.off(eventName, callback);
    };
  }

  off(eventName: string, callback: Function) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(
        cb => cb !== callback,
      );
    }
  }

  private emit(eventName: string, data?: any) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => callback(data));
    }
  }

  // Send message to server
  send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
      this.log(`Sent message: ${type}`, payload);
    } else {
      this.log('WebSocket not connected, queuing message');
      this.messageQueue.push({ type, payload });
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  disconnect() {
    this.shouldReconnect = false;
    this.reconnectAttempts = 0;
    this.token = null;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageQueue = [];
    this.listeners = {};
    this.log('Disconnected from WebSocket');
  }
}

export const wsConfig = {
  development: {
    url: 'ws://127.0.0.1:8086', // ← CHANGE THIS TO YOUR BACKEND IP
    debug: true,
  },
  staging: {
    url: 'ws://staging-api.toothalie.com:8086',
    debug: true,
  },
  production: {
    url: 'wss://api.toothalie.com:8086',
    debug: false,
  },
};

// Export singleton instance
export const wsManager = new WebSocketManager(wsConfig.development);
