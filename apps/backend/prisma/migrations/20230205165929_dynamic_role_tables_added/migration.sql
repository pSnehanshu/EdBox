-- CreateTable
CREATE TABLE "DynamicRole" (
    "id" VARCHAR(32) NOT NULL,
    "school_id" VARCHAR(32) NOT NULL,
    "permissions" SMALLINT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DynamicRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleUserMapping" (
    "user_id" VARCHAR(32) NOT NULL,
    "role_id" VARCHAR(32) NOT NULL,

    CONSTRAINT "RoleUserMapping_pkey" PRIMARY KEY ("user_id","role_id")
);

-- AddForeignKey
ALTER TABLE "DynamicRole" ADD CONSTRAINT "DynamicRole_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleUserMapping" ADD CONSTRAINT "RoleUserMapping_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleUserMapping" ADD CONSTRAINT "RoleUserMapping_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "DynamicRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
