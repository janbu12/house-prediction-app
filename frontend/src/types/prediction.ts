export interface PredictionInput {
  Land: number;
  Building: number;
  Bedroom: number;
  Bathroom: number;
  Carport: number;
  Latitude: number;
  Longitude: number;
  Month: number;
  City_Regency: string;
  Location: string;
}

export interface SimilarItem {
  Price: number;
  Location: string;
  "City/Regency": string;
  Bedroom: number;
  Bathroom: number;
  Carport: number;
  Land: number;
  Building: number;
  Latitude: number;
  Longitude: number;
  Month: number;
}

export interface PredictionResponse {
  predicted_price: number;
  formatted: string;
  similar?: SimilarItem[];
}
