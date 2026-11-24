// Shared (client + server) reference data.
export type City = { name: string; state: string; lat: number; lon: number };

export const CITIES: City[] = [
  { name: "Gorakhpur", state: "Uttar Pradesh", lat: 26.76, lon: 83.37 }, { name: "Varanasi", state: "Uttar Pradesh", lat: 25.32, lon: 82.99 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.85, lon: 80.95 }, { name: "Kanpur", state: "Uttar Pradesh", lat: 26.45, lon: 80.35 },
  { name: "Prayagraj", state: "Uttar Pradesh", lat: 25.43, lon: 81.85 }, { name: "Agra", state: "Uttar Pradesh", lat: 27.18, lon: 78.02 },
  { name: "Meerut", state: "Uttar Pradesh", lat: 28.98, lon: 77.71 }, { name: "Patna", state: "Bihar", lat: 25.6, lon: 85.14 },
  { name: "Gaya", state: "Bihar", lat: 24.8, lon: 85.0 }, { name: "Muzaffarpur", state: "Bihar", lat: 26.12, lon: 85.39 },
  { name: "Ranchi", state: "Jharkhand", lat: 23.34, lon: 85.31 }, { name: "Kolkata", state: "West Bengal", lat: 22.57, lon: 88.36 },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.3, lon: 85.82 }, { name: "Guwahati", state: "Assam", lat: 26.14, lon: 91.74 },
  { name: "Delhi", state: "Delhi", lat: 28.61, lon: 77.21 }, { name: "Jaipur", state: "Rajasthan", lat: 26.91, lon: 75.79 },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.24, lon: 73.02 }, { name: "Chandigarh", state: "Chandigarh", lat: 30.73, lon: 76.78 },
  { name: "Ludhiana", state: "Punjab", lat: 30.9, lon: 75.85 }, { name: "Dehradun", state: "Uttarakhand", lat: 30.32, lon: 78.03 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.26, lon: 77.41 }, { name: "Indore", state: "Madhya Pradesh", lat: 22.72, lon: 75.86 },
  { name: "Raipur", state: "Chhattisgarh", lat: 21.25, lon: 81.63 }, { name: "Ahmedabad", state: "Gujarat", lat: 23.02, lon: 72.57 },
  { name: "Surat", state: "Gujarat", lat: 21.17, lon: 72.83 }, { name: "Mumbai", state: "Maharashtra", lat: 19.08, lon: 72.88 },
  { name: "Pune", state: "Maharashtra", lat: 18.52, lon: 73.86 }, { name: "Nagpur", state: "Maharashtra", lat: 21.15, lon: 79.09 },
  { name: "Hyderabad", state: "Telangana", lat: 17.39, lon: 78.49 }, { name: "Bengaluru", state: "Karnataka", lat: 12.97, lon: 77.59 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.08, lon: 80.27 }, { name: "Coimbatore", state: "Tamil Nadu", lat: 11.02, lon: 76.96 },
  { name: "Kochi", state: "Kerala", lat: 9.93, lon: 76.27 }, { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.69, lon: 83.22 },
];

// Typical stock-cost / sales ratio band per business type. Used to flag "too good to be true" ledgers.
export const BIZ: Record<string, { label: string; band: [number, number] }> = {
  tea: { label: "Tea & snack stall", band: [0.38, 0.72] },
  veg: { label: "Vegetable cart", band: [0.55, 0.82] },
  fruit: { label: "Fruit stall", band: [0.55, 0.85] },
  chaat: { label: "Chaat / street food cart", band: [0.32, 0.62] },
  flower: { label: "Flower seller", band: [0.35, 0.7] },
  kirana: { label: "Small kirana / general store", band: [0.6, 0.85] },
  other: { label: "Other small business", band: [0.3, 0.85] },
};

export const rs = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
export const fmtD = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
