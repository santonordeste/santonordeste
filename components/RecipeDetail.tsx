
import React, { useState, useEffect, useRef } from 'react';
import { Recipe } from '../types';
import { generateRecipeAudio, decodeBase64, decodeAudioData } from '../services/geminiService';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      const textToSpeak = `Receita de ${recipe.title}. Ingredientes: ${recipe.ingredients.join(', ')}. Modo de preparo: ${recipe.instructions.join('. ')}`;
      const base64Audio = await generateRecipeAudio(textToSpeak);

      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const decoded = decodeBase64(base64Audio);
        const buffer = await decodeAudioData(decoded, audioContextRef.current);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlaying(false);
        source.start(0);
        sourceRef.current = source;
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio failed", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  useEffect(() => {
    return () => {
      sourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative">
        {/* Header Image */}
        <div className="relative h-64 md:h-80 bg-orange-100">
          {recipe.imageUrl && (
            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
          )}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{recipe.title}</h2>
            <div className="flex gap-4 text-white/90 text-sm">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>
                {recipe.cookingTime}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"/></svg>
                Dificuldade: {recipe.difficulty}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-2xl font-bold text-stone-900 mb-4 border-b-2 border-orange-200 pb-2">Modo de Preparo</h3>
              <ol className="space-y-4">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <p className="text-stone-700 leading-relaxed pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="bg-orange-50 p-6 rounded-xl border-l-4 border-orange-400">
              <h3 className="text-xl font-bold text-orange-900 mb-2">Curiosidade Cultural</h3>
              <p className="text-stone-700 italic leading-relaxed">"{recipe.history}"</p>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-stone-900">Ingredientes</h3>
                <button 
                  onClick={handlePlayAudio}
                  disabled={isLoadingAudio}
                  className={`p-2 rounded-full transition-all ${isPlaying ? 'bg-orange-600 text-white animate-pulse' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}
                  title="Ouvir receita"
                >
                  {isLoadingAudio ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-orange-600 rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd"/></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.414 0A5.982 5.982 0 0115 10a5.982 5.982 0 01-1.757 4.243 1 1 0 01-1.414-1.414A3.982 3.982 0 0013 10a3.982 3.982 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                  )}
                </button>
              </div>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3 text-stone-700 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-amber-100 p-6 rounded-xl border border-amber-200">
              <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Dica do Chef: Harmonização
              </h4>
              <div className="space-y-3">
                <p className="text-amber-800 text-sm leading-relaxed mb-2 font-medium">
                  Para realçar os sabores deste prato, experimente acompanhar com:
                </p>
                <ul className="space-y-2">
                  {recipe.drinkPairings?.map((drink, i) => (
                    <li key={i} className="flex items-center gap-2 text-amber-900 text-sm bg-white/50 px-3 py-1.5 rounded-lg border border-amber-200/50">
                      <span className="text-lg">🍹</span>
                      {drink}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
