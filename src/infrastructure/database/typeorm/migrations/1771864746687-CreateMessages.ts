import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMessages1771864746687 implements MigrationInterface {
    name = 'CreateMessages1771864746687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message_reads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message_id" uuid NOT NULL, "user_id" uuid NOT NULL, "read_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d3be462a9d7dfbbccc93c097e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."messages_type_enum" AS ENUM('text', 'image', 'file')`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "room_id" uuid NOT NULL, "sender_id" uuid NOT NULL, "content" text NOT NULL, "type" "public"."messages_type_enum" NOT NULL DEFAULT 'text', "is_edited" boolean NOT NULL DEFAULT false, "is_deleted" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message_reads" ADD CONSTRAINT "FK_977d4dcdd4dcb8441bac1b2d967" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_reads" ADD CONSTRAINT "FK_f2fde665440a5f6a7c2ea22f2bd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_1dda4fc8dbeeff2ee71f0088ba0" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_22133395bd13b970ccd0c34ab22" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_22133395bd13b970ccd0c34ab22"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_1dda4fc8dbeeff2ee71f0088ba0"`);
        await queryRunner.query(`ALTER TABLE "message_reads" DROP CONSTRAINT "FK_f2fde665440a5f6a7c2ea22f2bd"`);
        await queryRunner.query(`ALTER TABLE "message_reads" DROP CONSTRAINT "FK_977d4dcdd4dcb8441bac1b2d967"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TYPE "public"."messages_type_enum"`);
        await queryRunner.query(`DROP TABLE "message_reads"`);
    }

}
