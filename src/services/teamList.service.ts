import { TeamList } from "../models/TeamList.model";
import { TeamBoard } from "../models/TeamBoard.model";
import { AppDataSource } from "../config/database";
import { AppError } from "../middleware/errorHandler.middleware";

const teamListRepository = AppDataSource.getRepository(TeamList);
const teamBoardRepository = AppDataSource.getRepository(TeamBoard);

export const createTeamList = async (boardId: string, title: string, listOrder: number) => {
  // 1. Validate inputs, check if board exists
    if(!boardId || !title){
        throw new AppError("Board ID and List title are required", 400);
    }
    const board = await teamBoardRepository.findOneBy({id: boardId});
    if(!board){
        throw new AppError ("Board not found", 404);
    }
  // 2. Check if User has access to board.  (Simplified, you would likely check user's role/permissions)

  // 3. Create and save new list
  const newList = teamListRepository.create({
    title,
    board,
    listOrder
  });

  const savedList = await teamListRepository.save(newList);
  return {success: true, list: savedList};

}

export const updateTeamList = async (listId: string, updates: Partial<TeamList>) => {
    // 1. Find and Validate List and User Access
    const list = await teamListRepository.findOneBy({id: listId});
    if(!list){
        throw new AppError("List not found.", 404);
    }

    // 2. Apply updates, save, and return

    //Important: If listOrder changes, you have to re-order other lists if necessary.
    Object.assign(list, updates);
    const updatedList = await teamListRepository.save(list);
    return {success: true, list: updatedList}
}

//Gets all teamLists of a board.
export const getTeamLists = async(boardId: string) => {
 // 1. Check if board exists
    const board = await teamBoardRepository.findOneBy({id: boardId});
     if(!board){
        throw new AppError("Board not found", 404);
    }
 // 2. Return all lists that belong to board.
    const lists = await teamListRepository.find({
        where: {board: {id: boardId}},
        relations: {cards: true}, // optionally load cards as well
        order: {listOrder: 'ASC'} // Order the lists
    });

    return {success: true, lists: lists};
}

// Add delete, etc. as needed