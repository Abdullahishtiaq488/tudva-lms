import winston from 'winston';
import 'winston-daily-rotate-file'; // Import if using daily rotate

// Define log levels (you can customize these)
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3, // For HTTP request logging
    debug: 4,
};

// Define colors for log levels (optional, for console output)
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

// Create a Winston logger instance
const logger = winston.createLogger({
    levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
        winston.format.errors({ stack: true }), // Include error stacks
        winston.format.json() // Use JSON format
    ),
    transports: [
        // Console transport (for development)
        new winston.transports.Console({
            level: 'debug', // Log everything to console in development
            format: winston.format.combine(
                winston.format.colorize(), // Add colors to console output
                winston.format.printf(
                    (info) => `${info.timestamp} ${info.level}: ${info.message} ${info.stack || ''}`
                )
            )
        }),

        // File transport (for production - optional, but recommended)
        new winston.transports.DailyRotateFile({ // Use DailyRotateFile
            filename: 'logs/application-%DATE%.log', // Log file name (e.g., application-2023-10-27.log)
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m', // Max file size (20MB)
            maxFiles: '14d', // Keep logs for 14 days
            level: 'info', // Log 'info' level and above to files
        }),

         //Error File transport
         new winston.transports.DailyRotateFile({ // Use DailyRotateFile
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'error', // Log 'error'
        }),


    ],
    exceptionHandlers: [ // Handle uncaught exceptions
      new winston.transports.DailyRotateFile({ filename: 'logs/exceptions-%DATE%.log' })
    ],
    rejectionHandlers: [ // Handle unhandled promise rejections
      new winston.transports.DailyRotateFile({ filename: 'logs/rejections-%DATE%.log' })
    ]
});
export default logger;