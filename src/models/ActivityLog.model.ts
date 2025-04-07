// src/models/activityLog.model.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User.model";

@Entity("activity_logs")
export class ActivityLog extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string; // Use definite assignment assertion (!)

    @Column()
    action!: string; // Use definite assignment assertion (!)

    @Column()
    entityType!: string; // Use definite assignment assertion (!)

    @Column({ nullable: true })
    entityId?: string;

    @ManyToOne(() => User, { nullable: true }) // Optional user
    user?: User | null;

    @Column("text", { nullable: true })
    details?: string;

    @CreateDateColumn()
    createdAt!: Date; // Use definite assignment assertion (!)
}