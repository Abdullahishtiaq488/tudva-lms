// backend/src/models/Tag.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Course } from "./Course.model";

@Entity("tags")
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  tag_name!: string; // Store the actual tag name

  @ManyToOne(() => Course, (course) => course.tags)
  course!: Course; // Relationship to Course

  @Column()
  course_id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}