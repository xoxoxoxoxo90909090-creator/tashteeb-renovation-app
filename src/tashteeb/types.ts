export type ApartmentState = 'red_brick' | 'plastered' | 'semi_finished' | 'finished_renovation';
export type BudgetLevel = 'economic' | 'standard' | 'premium';
export type AppLanguage = 'ar' | 'en';

export interface ProjectData {
  selected_design: string | null;
  completed_stages: number;
  checked: Record<number, number[]>; // stageId -> task indices
  inspected: Record<number, boolean>; // stageId -> boolean
  room_choices: Record<string, number[]>; // roomName -> option indices
}

export interface ApartmentProject {
  id: string;
  project_name: string;
  area_sqm: number;
  bedroom_count: number;
  bathroom_count: number;
  balcony_count: number;
  living_count: number;
  kitchen_count: number;
  location?: string;
  current_state: ApartmentState;
  budget_level: BudgetLevel;
  budget_egp: number;
  project_data: ProjectData;
}

export interface ShoppingItem {
  id: string;
  project_id: string;
  stage_name: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price_egp: number;
  estimated_cost_egp: number;
  calculation_note?: string;
  is_purchased: boolean;
}

export interface StageTask {
  title: string;
  details: string;
}

export interface RenovationStage {
  id: number;
  title: string;
  guide: string;
  needsInspection: boolean;
  tasks: [string, string][];
}

export interface DesignOption {
  id: string;
  title: string;
  description: string;
  perSqm: number;
  image: string;
}

export interface RoomChoiceOption {
  label: string;
  options: [string, number][]; // [name, priceDiffEgp]
}

export interface CategoryItem {
  name: string;
  qty: number;
  unit: string;
  price: number;
  note: string;
}

export interface CalculatorCategory {
  title: string;
  stage: string;
  mainQty: number;
  mainUnit: string;
  mainLabel: string;
  assumption: string;
  items: CategoryItem[];
}
