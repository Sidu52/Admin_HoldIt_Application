export interface FeeBreakdown {
  platformFee: number;
  handlingFee?: number;
  packingFee?: number;
}

export interface PeakHours {
  startHour: number | null;
  endHour: number | null;
}

export interface BagPricingItem {
  basePrice: number;
  hourlyRate: number;
}

export interface BagPricing {
  small: BagPricingItem;
  medium: BagPricingItem;
  large: BagPricingItem;
  other: BagPricingItem;
}

export interface PricingRule {
  _id: string;
  id?: string;
  name: string;
  serviceAreaId: {
    _id: string;
    name: string;
    city?: string;
    state?: string;
  } | string;
  feeBreakdown: FeeBreakdown;
  perKmRate: number;
  maxAdvanceDistanceKm?: number;
  hourlyStorageRate: number;
  minChargeableHours?: number;
  maxDailyRate?: number | null;
  peakMultiplier?: number;
  peakHours?: PeakHours;
  bagPricing?: BagPricing;
  currency?: string;
  active: boolean;
  createdBy?: { _id: string; first_name?: string; last_name?: string; email?: string } | string;
  deactivatedBy?: { _id: string; first_name?: string; last_name?: string; email?: string } | string;
  deactivatedAt?: string;
  deactivationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceEstimateInput {
  serviceAreaId: string;
  pickupLocation: { lat: number; lng: number; address?: string };
  storeLocation: { lat: number; lng: number; address?: string };
  luggage?: { small?: number; medium?: number; large?: number; other?: number };
  storageHours?: number;
}
