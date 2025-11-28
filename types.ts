
export interface Question {
  id: string | number; // Support both DB string IDs and local number IDs
  text: string;
  options: string[]; // Array of 4 strings
  correctAnswerIndex: number; // 0-3
  topic?: string; // For DB storage
  difficulty?: 'easy' | 'medium' | 'hard'; // For DB storage
}

export enum GameStatus {
  AUTH_CHOICE = 'AUTH_CHOICE',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  TOPIC_SELECTION = 'TOPIC_SELECTION',
  SETTINGS = 'SETTINGS',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST',
  PROFILE = 'PROFILE',
  LEADERBOARD = 'LEADERBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}

export enum AnswerState {
  IDLE = 'IDLE',
  SELECTED = 'SELECTED',
  CORRECT = 'CORRECT',
  WRONG = 'WRONG',
}

export interface Lifelines {
  fiftyFifty: boolean;
  askAudience: boolean;
  askAI: boolean;
}

export interface AudienceData {
  A: number;
  B: number;
  C: number;
  D: number;
}

export interface User {
  username: string;
  password: string; // In a real app, this should be hashed
  name: string; // Changed from fullName
  age: string;  // Changed from dob, storing as string for input compatibility
  gender: 'Kişi' | 'Qadın' | ''; // New field
  totalPoints: number;
  completedTopics: string[]; // IDs of completed topics
  gamesPlayed: number;
  seenQuestions: string[]; // List of question texts already answered correctly
}

export type Topic = 'COGRAFIYA' | 'TARIX' | 'INCESENET' | 'DIN' | 'FANTASTIK' | 'FILM' | 'TEXNOLOGIYA' | 'IDMAN';

export interface TopicInfo {
  id: Topic;
  label: string;
  icon: string; // Icon name or component identifier
  description: string;
  color: string; // Tailwind color name (e.g., 'blue', 'red')
}

export interface ImageCache {
  [questionText: string]: string; // Maps question text to base64 image string
}