import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, CreateDateColumn } from "typeorm";
import { TeamCard } from "./TeamCard.model";
import { User } from "./User.model"; // Import User

@Entity("team_card_comments")
export class TeamCardComment extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("text")
    content!: string;

    @ManyToOne(() => TeamCard, (card) => card.comments)
    card!: TeamCard;

    @ManyToOne(() => User) // Many-to-one with User (comment author)
    author!: User;

    @CreateDateColumn()
    createdAt!: Date;
}