import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { TeamList } from "./TeamList.model";
import { User } from "./User.model"; // Import User
import { TeamCardComment } from "./TeamCardComment.model";
import { Attachment } from "./Attachment.model";

@Entity("team_cards")
export class TeamCard extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    title!: string;

    @Column("text", { nullable: true })
    description?: string;

    @ManyToOne(() => TeamList, (list) => list.cards)
    list!: TeamList;

    @ManyToMany(() => User, { cascade: true }) // Many-to-many relationship with User (assigned users)
    @JoinTable()
    assignedUsers!: User[];

    @OneToMany(() => TeamCardComment, (comment) => comment.card, { cascade: true })
    comments!: TeamCardComment[];
    
    @OneToMany(() => Attachment, (attachment) => attachment.card, { cascade: true })
    attachments!: Attachment[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ type: "timestamp", nullable: true }) // Add dueDate
    dueDate?: Date | null;

    @Column({ type: 'integer', default: 0 }) // Column to store the order/position
    cardOrder!: number;
}