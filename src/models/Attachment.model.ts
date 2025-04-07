import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity } from "typeorm";
import { TeamCard } from "./TeamCard.model";

@Entity("attachments")
export class Attachment extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    filename!: string;

    @Column()
    filePath!: string; // Or URL if using cloud storage

    @Column()
    fileType!: string; // e.g., "image/jpeg", "application/pdf"

    @ManyToOne(() => TeamCard, (card) => card.attachments)
    card!: TeamCard;

        @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
        uploadedAt!: Date;

        // Optional: Add uploader (user ID)
}