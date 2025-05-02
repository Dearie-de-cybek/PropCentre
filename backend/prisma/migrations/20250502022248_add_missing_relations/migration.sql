-- CreateTable
CREATE TABLE "PropertyPriceHistory" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PropertyPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationAnalytics" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "district" TEXT,
    "averagePrice" DECIMAL(10,2) NOT NULL,
    "priceTrend" DOUBLE PRECISION NOT NULL,
    "locationScore" INTEGER NOT NULL,
    "tourismRating" INTEGER NOT NULL,
    "developmentGrowth" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "insights" TEXT[],

    CONSTRAINT "LocationAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyView" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "userId" INTEGER,
    "viewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "PropertyView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyPriceHistory_propertyId_date_idx" ON "PropertyPriceHistory"("propertyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "LocationAnalytics_location_key" ON "LocationAnalytics"("location");

-- CreateIndex
CREATE INDEX "LocationAnalytics_location_idx" ON "LocationAnalytics"("location");

-- CreateIndex
CREATE INDEX "PropertyView_propertyId_idx" ON "PropertyView"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyView_userId_idx" ON "PropertyView"("userId");

-- AddForeignKey
ALTER TABLE "PropertyPriceHistory" ADD CONSTRAINT "PropertyPriceHistory_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyView" ADD CONSTRAINT "PropertyView_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyView" ADD CONSTRAINT "PropertyView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
