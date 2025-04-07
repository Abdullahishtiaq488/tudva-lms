// src/models/passwordResetToken.model.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { User } from "./User.model";

@Entity("password_reset_tokens") // MUST MATCH THE TABLE NAME
export class PasswordResetToken extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string; //Keep this.

  @ManyToOne(() => User) // Correct relationship
  @JoinColumn({ name: "userId" }) // Correct foreign key
  user!: User;

  @Column()
  token!: string;

  @Column({ type: 'timestamptz' }) // Use timestamptz
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}