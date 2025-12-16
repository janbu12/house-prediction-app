export interface PredictionInput {
  bedrooms: number;
  bathrooms: number;
  sqft_living: number;
  sqft_lot: number;
  floors: number;
  waterfront: number;
  condition: number;
  grade: number;
  sqft_above: number;
  sqft_basement: number;
  yr_built: number;
  yr_renovated: number;
}

export interface PredictionResponse {
  price_usd: number;
  price_idr: number;
  exchange_rate: number;
}
