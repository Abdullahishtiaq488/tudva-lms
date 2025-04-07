// src/models/UserProgress.model.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    BaseEntity,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
} from "typeorm";
import { User } from "./User.model";
import { Course } from "./Course.model";
import { Module } from "./Module.model";

@Entity("user_progress")
export class UserProgress extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, (user) => user.progress)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "uuid" })
    user_id!: string;

    @ManyToOne(() => Course)
    @JoinColumn({ name: "course_id" })
    course!: Course;

    @Column({ type: "uuid" })
    course_id!: string;

    @ManyToOne(() => Module)
    @JoinColumn({ name: "module_id" })
    module!: Module;

    @Column({ type: "uuid" })
    module_id!: string;

    @Column({ default: false })
    completed!: boolean;

    @Column({ type: "float", default: 0 })
    progress_percentage!: number;

    @Column({ type: "timestamp", nullable: true })
    last_accessed!: Date;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
