import { RouterOSResource, RouterOSInterface } from '../types';

// This URL points to the Node.js Middleware we created
const MIDDLEWARE_URL = 'http://localhost:3001/api/mikrotik';

export interface MikrotikCredentials {
    host: string;
    user: string;
    password?: string; // Optional if using SSH keys in advanced setups, but standard API needs pass
    port?: number;
}

export const fetchSystemHealth = async (creds: MikrotikCredentials): Promise<{ resource: RouterOSResource, interfaces: RouterOSInterface[] } | null> => {
    try {
        const response = await fetch(`${MIDDLEWARE_URL}/resource`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(creds)
        });

        if (!response.ok) throw new Error('Failed to connect to Middleware');

        const result = await response.json();
        if (result.status === 'success') {
            return result.data;
        } else {
            console.error('RouterOS API Error:', result.message);
            return null;
        }
    } catch (error) {
        console.error('Middleware Connection Error:', error);
        return null;
    }
};

export const executeCommand = async (creds: MikrotikCredentials, command: string[]): Promise<any> => {
    try {
        const response = await fetch(`${MIDDLEWARE_URL}/cmd`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...creds, command })
        });

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Command Execution Error:', error);
        return { error: 'Failed to execute command' };
    }
};

/**
 * Parses MikroTik "uptime" string (e.g. "4w2d1h30m") to human readable format
 */
export const formatUptime = (raw: string): string => {
    // Simple pass-through or advanced parsing logic here
    return raw;
};
