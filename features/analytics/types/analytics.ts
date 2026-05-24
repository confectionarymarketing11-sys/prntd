export type DateRangeKey = "7d" | "30d" | "90d";

export type TimeSeriesPoint = {
  label: string;
  revenueCents: number;
  orders: number;
  visitors?: number;
  addedToCart?: number;
  reachedCheckout?: number;
  checkoutCompleted?: number;
};

export type TopProductMetric = {
  productName: string;
  quantity: number;
  revenueCents: number;
};

export type TopCustomerMetric = {
  customerId: string | null;
  customerEmail: string;
  customerName: string | null;
  totalCents: number;
  orderCount: number;
};

export type AnalyticsSummary = {
  dailyVisitors: number;
  addedToCart: number;
  reachedCheckout: number;
  checkoutCompleted: number;
  conversionRate: number;
  liveVisitors: Array<{
    sessionId: string;
    visitorId: string;
    pathname: string | null;
    eventType: string;
    customerEmail: string | null;
    lastSeenAt: string;
  }>;
  revenueCents: number;
  paidOrders: number;
  averageOrderValueCents: number;
  openFulfillment: number;
  shippedOrders: number;
  productionBreakdown: Record<string, number>;
  revenueSeries: TimeSeriesPoint[];
  topProducts: TopProductMetric[];
  topCustomers: TopCustomerMetric[];
  recentActivity: { id: string; label: string; detail: string; createdAt: string }[];
};
