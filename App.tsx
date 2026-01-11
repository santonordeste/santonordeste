
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, Recipe } from './types';
import { SUGGESTED_RECIPES } from './constants';
import { fetchRecipe, generateFoodImage } from './services/geminiService';
import RecipeCard from './components/RecipeCard';
import RecipeDetail from './components/RecipeDetail';

// DICA PARA ELEMENTOR: Substitua o valor abaixo pela URL que você copiou da Galeria de Mídia do WordPress
const LOGO_URL = "logo.png"; 

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    searchQuery: '',
    isSearching: false,
    recipes: [],
    selectedRecipe: null,
    error: null,
    mode: 'traditional',
  });

  const handleSearch = async (query: string) => {
    const currentQuery = query || state.searchQuery;
    if (!currentQuery.trim()) return;

    setState(prev => ({ ...prev, isSearching: true, error: null }));
    
    try {
      const recipe = await fetchRecipe(currentQuery, state.mode);
      const imageUrl = await generateFoodImage(recipe.title);
      
      const recipeWithImage = { ...recipe, imageUrl: imageUrl || undefined };
      
      setState(prev => ({
        ...prev,
        recipes: [recipeWithImage, ...prev.recipes],
        isSearching: false,
        searchQuery: '',
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isSearching: false, error: "Eita! Não conseguimos temperar essa receita agora. Tente novamente!" }));
    }
  };

  const toggleMode = (mode: 'traditional' | 'pantry') => {
    setState(prev => ({ ...prev, mode, searchQuery: '' }));
  };

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, 500));
      if (state.recipes.length === 0) {
        handleSearch(SUGGESTED_RECIPES[Math.floor(Math.random() * SUGGESTED_RECIPES.length)]);
      }
    };
    init();
  }, []);

  return (
    <div className="santo-nordeste-app min-h-screen pb-12 text-stone-800">
      {/* Navbar / Header */}
      <header className="bg-orange-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white px-4 py-2 rounded-xl shadow-md border-2 border-black/10 flex items-center justify-center h-16 transition-all hover:shadow-xl group">
              <img 
                src={LOGO_URL} 
                alt="Santo Nordeste" 
                className="h-full w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-orange-600 font-bold text-2xl tracking-tighter">SANTO NORDESTE</span>';
                  }
                }}
              />
            </div>
            <div className="ml-4 hidden lg:block">
               <p className="text-orange-100 text-xs font-bold uppercase tracking-[0.2em] opacity-80">Receitas com Alma</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-orange-700/50 rounded-full px-4 py-2 text-sm font-medium border border-orange-500/30">
              {state.recipes.length} receitas na mesa
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Search Section */}
      <section className="bg-gradient-to-b from-orange-600 to-orange-50 pt-12 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-md">
              {state.mode === 'traditional' ? 'O que vamos cozinhar hoje, oxente?' : 'O que tem na sua dispensa?'}
            </h2>
            <p className="text-orange-50 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              {state.mode === 'traditional' 
                ? 'Peça uma receita típica do nosso Nordeste e nossa IA mestre-cuca prepara tudo pra você!' 
                : 'Diga quais ingredientes você tem e eu invento um banquete nordestino pra você!'}
            </p>
          </div>

          <div className="flex justify-center p-1 bg-orange-700/30 backdrop-blur-md rounded-2xl w-fit mx-auto border border-white/20">
            <button 
              onClick={() => toggleMode('traditional')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${state.mode === 'traditional' ? 'bg-white text-orange-600 shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              Receitas Tradicionais
            </button>
            <button 
              onClick={() => toggleMode('pantry')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${state.mode === 'pantry' ? 'bg-white text-orange-600 shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              Crie com meus ingredientes
            </button>
          </div>

          <div className="relative group max-w-2xl mx-auto">
            <input 
              type="text"
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(state.searchQuery)}
              placeholder={state.mode === 'traditional' ? "Ex: Baião de dois, Moqueca..." : "Ex: Macaxeira, charque, queijo..."}
              className="w-full h-16 pl-6 pr-32 bg-white rounded-2xl shadow-2xl text-stone-800 text-lg focus:ring-4 focus:ring-orange-400 outline-none border-none transition-all"
            />
            <button 
              onClick={() => handleSearch(state.searchQuery)}
              disabled={state.isSearching || !state.searchQuery.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md active:scale-95"
            >
              {state.isSearching ? (
                <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{state.mode === 'traditional' ? 'Buscar' : 'Criar'}</span>
                </>
              )}
            </button>
          </div>

          {state.mode === 'traditional' && (
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_RECIPES.map(item => (
                <button 
                  key={item}
                  onClick={() => handleSearch(item)}
                  className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm border border-white/30 backdrop-blur-sm transition-all shadow-sm"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 -mt-12">
        {state.error && (
          <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.recipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onClick={(r) => setState(prev => ({ ...prev, selectedRecipe: r }))}
            />
          ))}
          
          {state.isSearching && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-orange-200 animate-pulse flex flex-col items-center justify-center space-y-4 min-h-[300px]">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-stone-400 text-center font-medium">
                {state.mode === 'traditional' ? 'Buscando temperos...' : 'Inventando uma delícia...'}
              </p>
            </div>
          )}
        </div>

        {state.recipes.length === 0 && !state.isSearching && (
          <div className="text-center py-20 space-y-4">
            <div className="text-6xl animate-pulse">🍲</div>
            <h3 className="text-2xl font-bold text-stone-400">O fogo ainda está apagado.</h3>
            <p className="text-stone-400">Escolha um modo acima e comece sua jornada culinária!</p>
          </div>
        )}
      </main>

      {state.selectedRecipe && (
        <RecipeDetail 
          recipe={state.selectedRecipe} 
          onClose={() => setState(prev => ({ ...prev, selectedRecipe: null }))} 
        />
      )}

      <footer className="mt-20 border-t border-orange-100 py-12 text-center bg-white/50">
        <div className="flex flex-col items-center justify-center mb-8">
           <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-stone-100 mb-6 grayscale hover:grayscale-0 transition-all duration-700">
             <img src={LOGO_URL} alt="Santo Nordeste" className="h-10 w-auto opacity-40 hover:opacity-100 transition-opacity" />
           </div>
           <p className="text-orange-400 font-bold uppercase tracking-[0.4em] text-xs">Santo Nordeste • Sabor com Raiz</p>
        </div>
        <div className="flex justify-center gap-8 opacity-30">
           <span className="text-3xl hover:scale-125 transition-transform cursor-default">🌵</span>
           <span className="text-3xl hover:scale-125 transition-transform cursor-default">☀️</span>
           <span className="text-3xl hover:scale-125 transition-transform cursor-default">🌊</span>
           <span className="text-3xl hover:scale-125 transition-transform cursor-default">🥥</span>
        </div>
        <p className="mt-8 text-stone-400 text-xs">Orgulhosamente brasileiro 🇧🇷</p>
      </footer>
    </div>
  );
};

export default App;
