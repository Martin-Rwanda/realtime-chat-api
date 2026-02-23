import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersAndRefreshTokens1771853027106 implements MigrationInterface {
    name = 'CreateUsersAndRefreshTokens1771853027106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('online', 'offline', 'away')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "username" character varying NOT NULL, "password_hash" character varying NOT NULL, "avatar_url" character varying, "avatar_public_id" character varying, "status" "public"."users_status_enum" NOT NULL DEFAULT 'offline', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token_hash" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    }

}
