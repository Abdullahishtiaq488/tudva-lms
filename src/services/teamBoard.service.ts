// src/services/teamBoard.service.ts
import { TeamBoard } from "../models/TeamBoard.model";
import { AppDataSource } from "../config/database";
import { AppError } from "../middleware/errorHandler.middleware";
import { User, UserRole } from "../models/User.model";
import { TeamList } from "../models/TeamList.model";
import { TeamCard } from "../models/TeamCard.model"; // Import TeamCard
import { logActivity } from "./activityLog.service";
import { Brackets } from 'typeorm';
import { getIO } from '../socket'; // Import getIO


const teamBoardRepository = AppDataSource.getRepository(TeamBoard);
const userRepository = AppDataSource.getRepository(User);
const teamListRepository = AppDataSource.getRepository(TeamList);
const teamCardRepository = AppDataSource.getRepository(TeamCard); // Use TeamCard repository


export const createTeamBoard = async (title: string, description: string | undefined, userId: string) => {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
        throw new AppError("User not found.", 404);
    }
    if (user.role !== UserRole.Admin && user.role !== UserRole.Instructor) {
        throw new AppError("Unauthorized: Only admins and instructors can create boards.", 403);
    }
    if (!title) {
        throw new AppError("Board title is required.", 400);
    }

    const newBoard = teamBoardRepository.create({
        title,
        description,
    });

    const savedBoard = await teamBoardRepository.save(newBoard);

    const defaultListTitles = ["To Do", "In Progress", "Done"];
    for (const [index, listTitle] of defaultListTitles.entries()) {
        const newList = teamListRepository.create({
            title: listTitle,
            board: savedBoard,
            listOrder: index,
        });
        await teamListRepository.save(newList);
    }

    // Refetch to get lists (including the newly created ones).  This is important
    // for the socket.io emit to have the complete data.
    const returnBoard = await teamBoardRepository.findOne({
        where: { id: savedBoard.id },
        relations: { lists: true }
    });

    // Log the activity (pass userId, not user object)
    await logActivity("create", "TeamBoard", savedBoard.id, userId, { title: savedBoard.title });

    // Emit a 'boardCreated' event using Socket.IO
    if (returnBoard) { // Check if returnBoard exists before emitting
      getIO().emit('boardCreated', returnBoard); // Broadcast to all connected clients
    }


    return { success: true, board: returnBoard }; // Return returnBoard, not savedBoard
};

export const getAllTeamBoards = async () => {
    const boards = await teamBoardRepository.find({
        relations: {
            lists: {
                cards: {
                    assignedUsers: true,
                    comments: {
                        author: true
                    }
                }
            }
        },
        order: {
            createdAt: 'DESC',
            lists: {
                listOrder: 'ASC',
                cards: {
                    cardOrder: 'ASC'
                }
            }
        }
    });
    return { success: true, boards };
};

export const getTeamBoardById = async (boardId: string) => {
    const board = await teamBoardRepository.findOne({
        where: { id: boardId },
        relations: {
            lists: {
                cards: {
                    assignedUsers: true,
                    comments: {
                        author: true
                    }
                }
            }
        },
        order: {
            lists: {
                listOrder: 'ASC',
                cards: {
                    cardOrder: 'ASC'
                }
            }
        }
    });

    if (!board) {
        throw new AppError("Board not found.", 404);
    }

    return { success: true, board };
};



export const searchCards = async (
    boardId: string,
    query?: string,
    assignedUserId?: string,
    listId?: string,
    dueDateStatus?: "overdue" | "upcoming" | "none"
) => {
    const board = await teamBoardRepository.findOneBy({ id: boardId });
    if (!board) {
        throw new AppError("Board not found.", 404);
    }

    // Use teamCardRepository, not teamBoardRepository
    let queryBuilder = teamCardRepository.createQueryBuilder("card")
        .innerJoin("card.list", "list")
        .innerJoin("list.board", "board")
        .leftJoinAndSelect("card.assignedUsers", "assignedUser")
        .where("board.id = :boardId", { boardId });

    if (query) {
        queryBuilder = queryBuilder.andWhere(new Brackets(qb => {
            qb.where("card.title ILIKE :query", { query: `%${query}%` })
              .orWhere("card.description ILIKE :query", { query: `%${query}%` });
        }));
    }

    if (assignedUserId) {
        queryBuilder = queryBuilder.andWhere("assignedUser.id = :assignedUserId", { assignedUserId });
    }

    if (listId) {
        queryBuilder = queryBuilder.andWhere("list.id = :listId", { listId });
    }

    if (dueDateStatus) {
        const now = new Date();
        if (dueDateStatus === "overdue") {
            queryBuilder = queryBuilder.andWhere("card.dueDate < :now", { now });
        } else if (dueDateStatus === "upcoming") {
            queryBuilder = queryBuilder.andWhere("card.dueDate > :now", { now });
        } else if (dueDateStatus === "none") {
            queryBuilder = queryBuilder.andWhere("card.dueDate IS NULL");
        }
    }
    queryBuilder = queryBuilder.leftJoinAndSelect("card.comments", "comment")
    .leftJoinAndSelect("comment.author", "author")
    const results = await queryBuilder.getMany();

    return { success: true, results };
};

// Add update, delete, etc. as needed.