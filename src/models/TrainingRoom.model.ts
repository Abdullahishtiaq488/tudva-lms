import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("training_rooms")
export class TrainingRoom extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    institutionName!: string;

    @Column({ unique: true })
    contactEmail!: string;

    @Column({ nullable: true })
    contactPhone?: string;

    @Column()
    address!: string;

    // Optional: You could add fields for verification documents, admin user IDs, etc.

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}