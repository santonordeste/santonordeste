
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  history: string;
  cookingTime: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  imageUrl?: string;
  drinkPairings: string[];
}

export interface AppState {
  searchQuery: string;
  isSearching: boolean;
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  error: string | null;
  mode: 'traditional' | 'pantry';
}
