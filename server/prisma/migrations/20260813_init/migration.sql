-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION,
    "img" TEXT,
    "brandId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_info" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_image" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "img" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount" (
    "id" SERIAL NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "rate" INTEGER NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_option" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "address" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basket" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveryOptionId" INTEGER,

    CONSTRAINT "basket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basket_device" (
    "id" SERIAL NOT NULL,
    "basketId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "basket_device_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "type_name_key" ON "type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brand_name_key" ON "brand"("name");

-- CreateIndex
CREATE INDEX "discount_deviceId_idx" ON "discount"("deviceId");

-- CreateIndex
CREATE INDEX "discount_dateStart_dateEnd_idx" ON "discount"("dateStart", "dateEnd");

-- CreateIndex
CREATE UNIQUE INDEX "rating_userId_deviceId_key" ON "rating"("userId", "deviceId");

-- CreateIndex
CREATE INDEX "basket_userId_paidAt_idx" ON "basket"("userId", "paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "basket_device_basketId_deviceId_key" ON "basket_device"("basketId", "deviceId");

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_info" ADD CONSTRAINT "device_info_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_image" ADD CONSTRAINT "device_image_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount" ADD CONSTRAINT "discount_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket" ADD CONSTRAINT "basket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket" ADD CONSTRAINT "basket_deliveryOptionId_fkey" FOREIGN KEY ("deliveryOptionId") REFERENCES "delivery_option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket_device" ADD CONSTRAINT "basket_device_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "basket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket_device" ADD CONSTRAINT "basket_device_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;