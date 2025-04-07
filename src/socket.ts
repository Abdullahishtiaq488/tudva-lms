import { Server as HttpServer } from 'http'; // Import HttpServer
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer;

export const initSocketIO = (server: HttpServer) => {  // Accept HttpServer as argument
    io = new SocketIOServer(server, {
        cors: {
            origin: "*",  // Allow all origins in development
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log('a user connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('user disconnected:', socket.id);
        });

        // Example: Join a room for a specific board
        socket.on('joinBoard', (boardId: string) => {
            socket.join(boardId);
            console.log(`User ${socket.id} joined room ${boardId}`);
        });

        // Example: Leave a room for a specific board
        socket.on('leaveBoard', (boardId: string) => {
            socket.leave(boardId);
            console.log(`User ${socket.id} left room ${boardId}`);
        });

        // Add more event listeners here as needed (e.g., for card updates, comments)
    });

    return io;
};
// Function to get the Socket.IO instance
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized!");
    }
    return io;
};