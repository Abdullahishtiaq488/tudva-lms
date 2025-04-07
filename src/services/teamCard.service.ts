//src/services/teamCard.service.ts (Outline):
import { TeamCard } from "../models/TeamCard.model";
import { TeamList } from "../models/TeamList.model"; // Import
import { User } from "../models/User.model"; // Import
import { AppDataSource } from "../config/database";
import { AppError } from "../middleware/errorHandler.middleware";
import { TeamCardComment } from "../models/TeamCardComment.model";
import { logActivity } from "./activityLog.service";
import { AuthRequest } from "../middleware/auth.middleware"; // Import AuthRequest


const teamCardRepository = AppDataSource.getRepository(TeamCard);
const teamListRepository = AppDataSource.getRepository(TeamList);
const userRepository = AppDataSource.getRepository(User);
const teamCardCommentRepository = AppDataSource.getRepository(TeamCardComment);


export const createTeamCard = async (listId: string, title: string, description: string | undefined, assignedUserIds: string[], cardOrder: number, dueDate?: Date, req?: AuthRequest) => { //added duedate  // Use AuthRequest
    const list = await teamListRepository.findOneBy({ id: listId });
    if (!list) {
        throw new AppError("List not found.", 404);
    }

    // Get User ID for logging from req.user (set by authentication middleware)
    if (!req || !req.user) { // Check for req and req.user
        throw new AppError("User not authenticated.", 401); // Or handle as appropriate
    }
    const userId = req.user.userId; // Access userId


    const card = teamCardRepository.create({
        title,
        description,
        list,
        cardOrder,
        dueDate, // Set dueDate
    });

    if (assignedUserIds && assignedUserIds.length > 0) {
        const assignedUsers = await userRepository.findByIds(assignedUserIds);
        card.assignedUsers = assignedUsers;
    }

    const savedCard = await teamCardRepository.save(card);

    await logActivity("create", "TeamCard", savedCard.id, userId, { title: savedCard.title, listId }); // Pass userId
    return {success: true, card: savedCard};
};

export const updateTeamCard = async (cardId: string, updates: Partial<TeamCard>) => {
    const card = await teamCardRepository.findOneBy({id: cardId});
    if(!card)
    {
        throw new AppError("Card not found.", 404);
    }
    //Simplified authorization

        //Prevent updates, if card is not found.
    Object.assign(card, updates);
    const updatedCard = await teamCardRepository.save(card);
    return {success: true, card: updatedCard};
    // ... Real-time update (omitted for brevity) ...
}

export const moveTeamCard = async (cardId: string, newListId: string, newCardOrder: number) => {
    const card = await teamCardRepository.findOne({
        where: {id: cardId},
        relations: {list: { board: true }}
    });
    if(!card)
    {
        throw new AppError("Card not found", 404);
    }
    const newList = await teamListRepository.findOneBy({id: newListId});
    if(!newList)
    {
        throw new AppError("Target list not found", 404);
    }

    //Check, if card and list belong to same board.
    if(card.list.board.id !== newList.board.id){
        throw new AppError("Target list must be on the same board", 400);
    }

    //Simplified authorization
    const oldListId = card.list.id; // Get the old listId
    card.list = newList;

    // Start a transaction
    await AppDataSource.manager.transaction(async transactionalEntityManager => {
        //Must use transactionalEntityManager for all operations inside transaction.

        // Update the card's list and order
        await transactionalEntityManager.save(card);

        // Re-order cards in the *old* list (remove gap)
        await transactionalEntityManager
            .createQueryBuilder()
            .update(TeamCard)
            .set({ cardOrder: () => "cardOrder - 1" })
            .where("list = :oldListId", { oldListId })
            .andWhere("cardOrder > :oldCardOrder", { oldCardOrder: card.cardOrder })
            .execute();

        // Re-order cards in the *new* list (make space)
        await transactionalEntityManager
            .createQueryBuilder()
            .update(TeamCard)
            .set({ cardOrder: () => "cardOrder + 1" })
            .where("list = :newListId", { newListId })
            .andWhere("cardOrder >= :newCardOrder", { newCardOrder })
            .execute();

            // Update the card's order to the new position
            card.cardOrder = newCardOrder;
            await transactionalEntityManager.save(card);
    });
        return {success: true, card};
    // ... Real-time update (omitted for brevity) ...
}

export const addCommentToCard = async (cardId: string, userId: string, content: string) => {
    const card = await teamCardRepository.findOneBy({id: cardId});
    const user = await userRepository.findOneBy({id: userId});

    if(!card){
        throw new AppError("Card not found", 404);
    }
    if(!user){
        throw new AppError("User not found", 404);
    }

    //Simplified authorization

    const newComment = teamCardCommentRepository.create({
        content: content,
        card: card,
        author: user
    });

    const savedComment = await teamCardCommentRepository.save(newComment);
    return {success: true, comment: savedComment};
}

// Add delete, getCard, etc. as needed