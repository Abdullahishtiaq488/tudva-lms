//Remove or comment out: import cron from 'node-cron';
import { AppDataSource } from '../config/database';
import { TeamCard } from '../models/TeamCard.model';
//Remove or comment out: import { sendEmail } from './email';
import { addEmailJob } from './queue'; // Import the addEmailJob function

const teamCardRepository = AppDataSource.getRepository(TeamCard);

export const startScheduledTasks = async () => { // Make this function async
    // We no longer use node-cron directly here.  Instead, we'll add jobs to the queue.

    // Find cards with due dates and schedule reminders *only once* (e.g., when the server starts)
    //  In a real application, you would also need to handle cases where new cards are created
    //  or due dates are changed *after* the server has started.
    const upcomingCards = await teamCardRepository.find({
        where: {
            dueDate: {
                $exists: true, // Find cards where dueDate is not null
                $ne: null,      // Ensure dueDate is not null
            } as any,
        },
        relations: { assignedUsers: true },
    });


    for (const card of upcomingCards) {
       if(!card.dueDate){ //If no due date, then continue.
           continue;
        }
        const now = new Date();

        //Calculate delay.
        const delayMilliseconds = card.dueDate.getTime() - now.getTime() - (60 * 60 * 1000); //Due date - now - 1 hour.

       if(delayMilliseconds > 0){ //Only schedule if dueDate is in the future.
         for (const user of card.assignedUsers) {
              if (user && user.email) { //Basic null check.
                    // Schedule the reminder email using BullMQ
                    addEmailJob(
                        'sendReminderEmail',
                        {
                            to: user.email,
                            subject: `Reminder: Task "${card.title}" is Due Soon`,
                            template: 'taskReminder',
                            context: {
                                cardTitle: card.title,
                                dueDate: card.dueDate.toISOString(), // Format the date
                                userName: user.fullName
                            }
                        },
                        delayMilliseconds // Schedule for 1 hour before the due date
                    );
              }
         }
       }
    }
};