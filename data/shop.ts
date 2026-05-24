export function priceDesign(
  product: Product,
  quantity: number,
  frontLayers: DesignLayer[],
  backLayers: DesignLayer[],
) {
  const sidesUsed = [
    frontLayers.length > 0,
    backLayers.length > 0,
  ].filter(Boolean).length;

  const setupFee =
    sidesUsed * 5;

  const detailFee =
    (frontLayers.length +
      backLayers.length) *
    1.5;

  /**
   * BUSINESS CARDS
   * Tier pricing
   */
  if (
    product.id ===
    "business-cards"
  ) {
    const tiers = [
      {
        quantity: 50,
        price: 32,
      },
      {
        quantity: 100,
        price: 38,
      },
      {
        quantity: 250,
        price: 55,
      },
      {
        quantity: 500,
        price: 85,
      },
      {
        quantity: 1000,
        price: 145,
      },
    ];

    const matchedTier =
      tiers.find(
        (tier) =>
          tier.quantity ===
          quantity,
      ) ??
      tiers[0];

    const total =
      matchedTier.price +
      setupFee +
      detailFee;

    return {
      unitPrice:
        roundMoney(
          total /
            matchedTier.quantity,
        ),

      lineTotal:
        roundMoney(total),

      printType:
        quantity >= 500
          ? "Bulk Offset"
          : "Premium Digital",
    };
  }

  /**
   * DEFAULT PRODUCTS
   * Shirts/stickers/etc
   */
  const bulkDiscount =
    quantity >= 25
      ? 0.82
      : quantity >= 12
        ? 0.9
        : quantity >= 6
          ? 0.95
          : 1;

  const unitPrice =
    (product.basePrice +
      setupFee +
      detailFee) *
    bulkDiscount;

  return {
    unitPrice:
      roundMoney(
        unitPrice,
      ),

    lineTotal:
      roundMoney(
        unitPrice *
          quantity,
      ),

    printType:
      quantity >= 25
        ? "Bulk Production"
        : "Standard Production",
  };
}