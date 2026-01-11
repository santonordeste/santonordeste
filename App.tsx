
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, Recipe } from './types';
import { SUGGESTED_RECIPES } from './constants';
import { fetchRecipe, generateFoodImage } from './services/geminiService';
import RecipeCard from './components/RecipeCard';
import RecipeDetail from './components/RecipeDetail';

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

  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const key = (window as any).GEMINI_API_KEY || process.env.API_KEY;
    if (!key || key === 'undefined' || key === '') {
      setHasApiKey(false);
    }
  }, []);

  const handleSearch = async (query: string) => {
    const currentQuery = query || state.searchQuery;
    if (!currentQuery.trim()) return;
    if (!hasApiKey) {
      setState(prev => ({ ...prev, error: "API Key não configurada. Veja as instruções abaixo." }));
      return;
    }

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
        error: "Eita! O fogo apagou. Verifique se sua API Key é válida." 
      }));
    }
  };

  const toggleMode = (mode: 'traditional' | 'pantry') => {
    setState(prev => ({ ...prev, mode, searchQuery: '' }));
  };

  useEffect(() => {
    if (hasApiKey) {
      const init = async () => {
        await new Promise(r => setTimeout(r, 1000));
        if (state.recipes.length === 0) {
          handleSearch(SUGGESTED_RECIPES[Math.floor(Math.random() * SUGGESTED_RECIPES.length)]);
        }
      };
      init();
    }
  }, [hasApiKey]);

  if (!hasApiKey) {
    return (
      <div className="santo-nordeste-app min-h-screen flex items-center justify-center bg-orange-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-orange-600">
          <h2 className="text-2xl font-black text-orange-600 mb-4">Configuração Necessária</h2>
          <p className="text-stone-600 mb-6">Para o app funcionar no Elementor, você precisa definir sua <strong>API Key</strong> do Google Gemini.</p>
          <div className="bg-stone-100 p-4 rounded-xl text-xs font-mono mb-6 overflow-x-auto">
            &lt;script&gt;<br/>
            &nbsp;&nbsp;window.GEMINI_API_KEY = "SUA_CHAVE_AQUI";<br/>
            &lt;/script&gt;
          </div>
          <p className="text-xs text-stone-400">Insira o código acima em um widget HTML antes do app.</p>
        </div>
      </div>
    );
  }

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
               <p className="text-orange-100 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Receitas com Alma Nordestina</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-orange-700/40 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-orange-500/30">
              {state.recipes.length} receitas na mesa
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-600 to-[#fffaf0] pt-12 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg leading-tight playfair italic">
              {state.mode === 'traditional' ? 'O que vamos cozinhar hoje, vixe?' : 'O que tem na sua feira?'}
            </h2>
            <p className="text-orange-50 text-lg md:text-xl max-w-2xl mx-auto font-medium opacity-90">
              {state.mode === 'traditional' 
                ? 'Peça qualquer prato do nosso Nordeste e eu te ensino o passo a passo com história!' 
                : 'Diga seus ingredientes e eu invento um banquete pra você agora mesmo!'}
            </p>
          </div>

          <div className="flex justify-center p-1.5 bg-orange-800/20 backdrop-blur-sm rounded-2xl w-fit mx-auto border border-white/20">
            <button 
              onClick={() => toggleMode('traditional')}
              className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${state.mode === 'traditional' ? 'bg-white text-orange-600 shadow-xl scale-105' : 'text-white hover:bg-white/10'}`}
            >
              Tradicionais
            </button>
            <button 
              onClick={() => toggleMode('pantry')}
              className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${state.mode === 'pantry' ? 'bg-white text-orange-600 shadow-xl scale-105' : 'text-white hover:bg-white/10'}`}
            >
              Inventar
            </button>
          </div>

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
                  className="px-4 py-2 bg-white/20 hover:bg-white/40 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/40 backdrop-blur-sm transition-all hover:shadow-lg"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 -mt-10">
        {state.error && (
          <div className="mb-8 p-6 bg-white border-l-8 border-red-500 text-red-700 rounded-2xl shadow-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌵</span>
              <div>
                <p className="font-black text-lg uppercase tracking-tight">Vixe, deu erro!</p>
                <p className="text-sm opacity-80">{state.error}</p>
              </div>
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
            <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-dashed border-orange-200 animate-pulse flex flex-col items-center justify-center space-y-6 min-h-[400px]">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center shadow-inner">
                <div className="text-5xl animate-bounce">🥘</div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-orange-600 font-black text-xl uppercase tracking-tighter italic">Temperando a receita...</p>
                <p className="text-stone-400 text-sm font-medium">Buscando os segredos do sertão.</p>
              </div>
            </div>
          )}
        </div>

        {state.recipes.length === 0 && !state.isSearching && (
          <div className="text-center py-24 bg-white/40 rounded-[3rem] border-4 border-dashed border-stone-200 backdrop-blur-sm">
            <div className="text-8xl mb-6 opacity-40">🏜️</div>
            <h3 className="text-3xl font-black text-stone-300 uppercase tracking-widest">A cozinha está silenciosa...</h3>
            <p className="text-stone-400 mt-2 font-medium">Peça uma receita para acender o fogão!</p>
          </div>
        )}
      </main>

      {state.selectedRecipe && (
        <RecipeDetail 
          recipe={state.selectedRecipe} 
          onClose={() => setState(prev => ({ ...prev, selectedRecipe: null }))} 
        />
      )}

      <footer className="mt-24 py-20 text-center">
        <div className="max-w-xl mx-auto px-4">
           <div className="bg-white inline-block px-10 py-5 rounded-[2rem] shadow-xl border-2 border-orange-100 mb-10 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
             <img src={DEFAULT_LOGO} alt="Santo Nordeste" className="h-12 w-auto" />
           </div>
           <div className="space-y-6">
             <p className="text-orange-500 font-black uppercase tracking-[0.6em] text-[10px]">Santo Nordeste • Tradição Digital</p>
             <div className="flex justify-center gap-12 opacity-30 text-4xl">
               <span className="hover:scale-150 hover:opacity-100 transition-all cursor-default">🌵</span>
               <span className="hover:scale-150 hover:opacity-100 transition-all cursor-default">☀️</span>
               <span className="hover:scale-150 hover:opacity-100 transition-all cursor-default">🌊</span>
               <span className="hover:scale-150 hover:opacity-100 transition-all cursor-default">🥥</span>
             </div>
             <p className="text-stone-400 text-[9px] pt-8 font-bold italic tracking-widest uppercase">"O Nordeste não é um lugar, é um sabor que não se esquece."</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
