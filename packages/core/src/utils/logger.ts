import { DEBUG } from '../config';

/**
 * Creates a namespaced logger for a specific component
 * @param namespace The logger namespace (component name)
 * @returns Logger functions
 */
export function createLogger(namespace: string) {
  const prefix = `[${namespace}]`;
  
  return {
    /**
     * Log a debug message (only shown when debug is enabled)
     */
    debug: (message: string, data?: any) => {
      if (!DEBUG.ENABLED) return;
      
      const logMessage = data 
        ? `${message}: ${JSON.stringify(data, null, 2)}`
        : message;
        
      console.log(`${prefix} ${logMessage}`);
    },
    
    /**
     * Log an error message
     */
    error: (message: string, error?: any) => {
      const errorDetails = error instanceof Error 
        ? { message: error.message, stack: error.stack }
        : String(error);
        
      console.error(`${prefix} ${message}`, errorDetails);
    },
    
    /**
     * Log an info message
     */
    info: (message: string) => {
      console.info(`${prefix} ${message}`);
    }
  };
} 