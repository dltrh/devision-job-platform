import { useEffect, useRef, useCallback, useState } from "react";
import { Notification } from "@/types/notification";

interface WebSocketNotificationOptions {
    url: string;
    enabled?: boolean;
    onNotification?: (notification: Notification) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Event) => void;
    reconnectAttempts?: number;
    reconnectInterval?: number;
}

interface UseWebSocketNotificationReturn {
    isConnected: boolean;
    lastNotification: Notification | null;
    connect: () => void;
    disconnect: () => void;
}

export const useWebSocketNotification = (
    options: WebSocketNotificationOptions
): UseWebSocketNotificationReturn => {
    const {
        url,
        enabled = true,
        onNotification,
        onConnect,
        onDisconnect,
        onError,
        reconnectAttempts = 5,
        reconnectInterval = 3000,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [lastNotification, setLastNotification] = useState<Notification | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectCountRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                setIsConnected(true);
                reconnectCountRef.current = 0;
                onConnect?.();
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "notification") {
                        const notification = data.payload as Notification;
                        setLastNotification(notification);
                        onNotification?.(notification);
                    }
                } catch (err) {
                    console.error("Failed to parse WebSocket message:", err);
                }
            };

            ws.onerror = (event) => {
                console.error("WebSocket error:", event);
                onError?.(event);
            };

            ws.onclose = () => {
                setIsConnected(false);
                onDisconnect?.();

                // Attempt to reconnect
                if (enabled && reconnectCountRef.current < reconnectAttempts) {
                    reconnectCountRef.current += 1;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                }
            };

            wsRef.current = ws;
        } catch (err) {
            console.error("Failed to connect WebSocket:", err);
        }
    }, [
        url,
        enabled,
        onNotification,
        onConnect,
        onDisconnect,
        onError,
        reconnectAttempts,
        reconnectInterval,
    ]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        wsRef.current?.close();
        wsRef.current = null;
        setIsConnected(false);
    }, []);

    // Connect on mount if enabled
    useEffect(() => {
        if (enabled) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [enabled, connect, disconnect]);

    return {
        isConnected,
        lastNotification,
        connect,
        disconnect,
    };
};
