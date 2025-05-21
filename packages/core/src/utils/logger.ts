import { DEBUG } from '../config';

/**
 * Creates a namespaced logger for a specific component
 * @param namespace The logger namespace (component name)
 * @returns Logger functions
 */
export function createLogger(namespace: string) {
  const prefix = `[${namespace}]`;
  
  /**
   * Safely stringify data, handling circular references
   */
  const safeStringify = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      // Handle circular references or other JSON.stringify errors
      return String(data);
    }
  };
  
  return {
    /**
     * Log a debug message (only shown when debug is enabled)
     */
    debug: (message: string, data?: any) => {
      if (!DEBUG.ENABLED) return;
      
      const logMessage = data 
        ? `${message}: ${safeStringify(data)}`
        : message;
        
      console.log(`${prefix} ${logMessage}`);
    },
    
    /**
     * Log an error message
     */
    error: (message: string, error?: any) => {
      let errorDetails: any;
      
      if (error instanceof Error) {
        errorDetails = { message: error.message, stack: error.stack };
      } else if (error !== undefined && error !== null) {
        try {
          errorDetails = String(error);
        } catch (e) {
          errorDetails = "Unserializable error object";
        }
      }
        
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