import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameCourseColumns1741861556259 implements MigrationInterface {
    name = 'RenameCourseColumns1741861556259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lectures" ADD "sortOrder" integer`);
        await queryRunner.query(`ALTER TABLE "lectures" ADD "slot_id" uuid`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "format" text NOT NULL DEFAULT 'recorded'`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "bookingStatus" character varying`);
        await queryRunner.query(`ALTER TABLE "lectures" ADD CONSTRAINT "FK_809392254642e2d3500d9a60515" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lectures" DROP CONSTRAINT "FK_809392254642e2d3500d9a60515"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "bookingStatus"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "format"`);
        await queryRunner.query(`ALTER TABLE "lectures" DROP COLUMN "slot_id"`);
        await queryRunner.query(`ALTER TABLE "lectures" DROP COLUMN "sortOrder"`);
    }

}
