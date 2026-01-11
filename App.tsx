
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, Recipe } from './types';
import { SUGGESTED_RECIPES } from './constants';
import { fetchRecipe, generateFoodImage } from './services/geminiService';
import RecipeCard from './components/RecipeCard';
import RecipeDetail from './components/RecipeDetail';

// Se você estiver usando WordPress, pode definir essa variável globalmente no cabeçalho
const DEFAULT_LOGO = (window as any).SANTO_NORDESTE_LOGO || "logo.png"; 

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
      setState(prev => ({ 
        ...prev, 
        isSearching: false, 
        error: "Eita! O fogo apagou. Verifique sua conexão ou se a API Key está configurada corretamente." 
      }));
    }
  };

  const toggleMode = (mode: 'traditional' | 'pantry') => {
    setState(prev => ({ ...prev, mode, searchQuery: '' }));
  };

  useEffect(() => {
    const init = async () => {
      // Pequeno delay para garantir que o layout renderizou
      await new Promise(r => setTimeout(r, 800));
      if (state.recipes.length === 0) {
        handleSearch(SUGGESTED_RECIPES[Math.floor(Math.random() * SUGGESTED_RECIPES.length)]);
      }
    };
    init();
  }, []);

  return (
    <div className="santo-nordeste-app min-h-screen pb-12 text-stone-800 bg-[#fffaf0]">
      {/* Navbar / Header */}
      <header className="bg-orange-600 text-white shadow-lg sticky top-0 z-40 border-b-4 border-orange-700">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white px-4 py-2 rounded-xl shadow-md border-2 border-orange-200 flex items-center justify-center h-16">
              <img 
                src={DEFAULT_LOGO} 
                alt="Santo Nordeste" 
                className="h-full w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-orange-600 font-bold text-xl">SANTO NORDESTE</span>';
                  }
                }}
              />
            </div>
            <div className="ml-4 hidden md:block">
               <p className="text-orange-100 text-xs font-bold uppercase tracking-[0.2em] opacity-80">Receitas com Alma Nordestina</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-orange-700/40 rounded-full px-4 py-2 text-sm font-medium border border-orange-500/30">
              {state.recipes.length} delícias prontas
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-600 to-[#fffaf0] pt-12 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg leading-tight">
              {state.mode === 'traditional' ? 'O que vamos cozinhar hoje, vixe?' : 'O que tem na sua feira?'}
            </h2>
            <p className="text-orange-50 text-lg md:text-xl max-w-2xl mx-auto font-medium opacity-90">
              {state.mode === 'traditional' 
                ? 'Peça qualquer prato do nosso Nordeste e eu te ensino o passo a passo com história!' 
                : 'Diga seus ingredientes e eu invento um banquete pra você agora mesmo!'}
            </p>
          </div>

          {/* Mode Selector */}
          <div className="flex justify-center p-1.5 bg-orange-800/20 backdrop-blur-sm rounded-2xl w-fit mx-auto border border-white/20">
            <button 
              onClick={() => toggleMode('traditional')}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${state.mode === 'traditional' ? 'bg-white text-orange-600 shadow-xl scale-105' : 'text-white hover:bg-white/10'}`}
            >
              Pratos Tradicionais
            </button>
            <button 
              onClick={() => toggleMode('pantry')}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${state.mode === 'pantry' ? 'bg-white text-orange-600 shadow-xl scale-105' : 'text-white hover:bg-white/10'}`}
            >
              Meus Ingredientes
            </button>
          </div>

          {/* Search Box */}
          <div className="relative group max-w-2xl mx-auto">
            <input 
              type="text"
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(state.searchQuery)}
              placeholder={state.mode === 'traditional' ? "Ex: Baião de dois, Buchada..." : "Ex: Carne seca, nata, mandioca..."}
              className="w-full h-16 pl-6 pr-36 bg-white rounded-2xl shadow-2xl text-stone-800 text-lg focus:ring-4 focus:ring-orange-400 outline-none border-2 border-transparent transition-all"
            />
            <button 
              onClick={() => handleSearch(state.searchQuery)}
              disabled={state.isSearching || !state.searchQuery.trim()}
              className="absolute right-2 top-2 bottom-2 px-8 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              {state.isSearching ? (
                <div className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin" />
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
                  className="px-4 py-2 bg-white/20 hover:bg-white/40 text-white rounded-full text-xs font-bold border border-white/40 backdrop-blur-sm transition-all hover:shadow-lg"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 -mt-10">
        {state.error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl shadow-lg animate-bounce">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌵</span>
              <p className="font-bold">{state.error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {state.recipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onClick={(r) => setState(prev => ({ ...prev, selectedRecipe: r }))}
            />
          ))}
          
          {state.isSearching && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-dashed border-orange-200 animate-pulse flex flex-col items-center justify-center space-y-6 min-h-[350px]">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="text-4xl animate-bounce">🥘</div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-orange-600 font-bold text-lg">Temperando a receita...</p>
                <p className="text-stone-400 text-sm">Nossa IA está buscando os melhores segredos culinários.</p>
              </div>
            </div>
          )}
        </div>

        {state.recipes.length === 0 && !state.isSearching && (
          <div className="text-center py-20 bg-white/30 rounded-3xl border-2 border-dashed border-stone-200">
            <div className="text-7xl mb-6">🏜️</div>
            <h3 className="text-2xl font-bold text-stone-400">A cozinha está silenciosa...</h3>
            <p className="text-stone-400 mt-2">Peça uma receita ou selecione uma sugestão acima para começar!</p>
          </div>
        )}
      </main>

      {/* Modals */}
      {state.selectedRecipe && (
        <RecipeDetail 
          recipe={state.selectedRecipe} 
          onClose={() => setState(prev => ({ ...prev, selectedRecipe: null }))} 
        />
      )}

      {/* Regional Footer */}
      <footer className="mt-20 py-16 text-center">
        <div className="max-w-xl mx-auto px-4">
           <div className="bg-white inline-block px-8 py-4 rounded-2xl shadow-sm border border-orange-100 mb-8 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-help">
             <img src={DEFAULT_LOGO} alt="Santo Nordeste" className="h-10 w-auto" />
           </div>
           <div className="space-y-4">
             <p className="text-orange-500 font-black uppercase tracking-[0.5em] text-[10px]">Santo Nordeste • Sabor, Cultura e Raiz</p>
             <div className="flex justify-center gap-10 opacity-40 text-3xl">
               <span title="Cangaço">⚔️</span>
               <span title="Sol do Sertão">☀️</span>
               <span title="Praias">🌊</span>
               <span title="Cordel">📜</span>
             </div>
             <p className="text-stone-400 text-[10px] pt-4 font-medium italic">"O Nordeste não é um lugar, é um estado de espírito e um prato cheio."</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
