import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameCourseColumns1741834100465 implements MigrationInterface {
    name = 'RenameCourseColumns1741834100465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lectures" DROP CONSTRAINT "FK_809392254642e2d3500d9a60515"`);
        await queryRunner.query(`ALTER TABLE "lectures" DROP COLUMN "sortOrder"`);
        await queryRunner.query(`ALTER TABLE "lectures" DROP COLUMN "slot_id"`);
        await queryRunner.query(`ALTER TABLE "lectures" DROP COLUMN "topic"`);
        await queryRunner.query(`ALTER TABLE "lectures" DROP COLUMN "contentUrl"`);
        await queryRunner.query(`ALTER TABLE "lectures" ADD "topicName" text`);
        await queryRunner.query(`ALTER TABLE "lectures" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "lectures" ADD "videoUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "lectures" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "lectures" ADD "title" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lectures" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "lectures" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lectures" DROP COLUMN "videoUrl"`);
        await queryRunner.query(`ALTER TABLE "lectures" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "lectures" DROP COLUMN "topicName"`);
        await queryRunner.query(`ALTER TABLE "lectures" ADD "contentUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "lectures" ADD "topic" text`);
        await queryRunner.query(`ALTER TABLE "lectures" ADD "slot_id" uuid`);
        await queryRunner.query(`ALTER TABLE "lectures" ADD "sortOrder" integer`);
        await queryRunner.query(`ALTER TABLE "lectures" ADD CONSTRAINT "FK_809392254642e2d3500d9a60515" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
