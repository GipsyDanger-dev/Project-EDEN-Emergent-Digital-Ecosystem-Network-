// Core types for EDEN

export interface Citizen {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  location: Location;
  state: CitizenState;
  createdAt: number;
}

export interface CitizenState {
  needs: Needs;
  emotions: Emotions;
  skills: Skill[];
  inventory: Item[];
}

export interface Needs {
  hunger: number;    // 0-100
  energy: number;    // 0-100
  social: number;    // 0-100
  safety: number;    // 0-100
}

export interface Emotions {
  happiness: number;  // -100 to 100
  sadness: number;    // -100 to 100
  anger: number;      // -100 to 100
  fear: number;       // -100 to 100
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  experience: number;
}

export interface Item {
  id: string;
  name: string;
  type: string;
  quantity: number;
}

export interface Location {
  x: number;
  y: number;
  z: number;
}

export interface WorldState {
  time: number;
  weather: Weather;
  resources: Resource[];
  citizens: Citizen[];
}

export interface Weather {
  type: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  temperature: number;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  amount: number;
  location: Location;
}

export interface Event {
  id: string;
  type: string;
  timestamp: number;
  citizenId?: string;
  data: Record<string, unknown>;
  metadata: EventMetadata;
}

export interface EventMetadata {
  tick: number;
  cause: string;
}

export interface Decision {
  action: string;
  target?: string;
  explanation: string;
  confidence: number;
}
