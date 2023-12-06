-- CreateTable
CREATE TABLE "Coupon" (
    "product_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "raw_discount" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "short_url" TEXT NOT NULL,
    "rating_star" INTEGER NOT NULL,
    "shop_location" TEXT NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("product_id")
);
