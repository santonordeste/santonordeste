
import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div 
      onClick={() => onClick(recipe)}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02] hover:shadow-xl group"
    >
      <div className="relative h-48 w-full overflow-hidden bg-orange-100">
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-orange-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded text-xs font-semibold text-orange-800 uppercase tracking-wider">
          {recipe.difficulty}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-stone-900 mb-1 group-hover:text-orange-600 transition-colors">
          {recipe.title}
        </h3>
        <p className="text-stone-500 text-sm line-clamp-2 mb-4">
          {recipe.description}
        </p>
        <div className="flex items-center text-xs text-stone-400">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {recipe.cookingTime}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
