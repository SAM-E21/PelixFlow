
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { improveRecommendations, type ImproveRecommendationsOutput } from '@/ai/flows/improve-recommendations';
import type { PreferenceFormValues } from '@/lib/types';
import { toast } from './use-toast';
import { useAuth } from './use-auth';
import { v4 as uuidv4 } from 'uuid';

type Recommendation = ImproveRecommendationsOutput[0];

interface Feedback {
  recommendation: Recommendation;
  liked: boolean;
}

export interface CustomList {
    id: string;
    name: string;
    items: Recommendation[];
    createdAt: number;
}

interface RecommendationContextType {
  recommendations: Recommendation[];
  favorites: Recommendation[];
  history: Recommendation[];
  feedback: Feedback[];
  lists: CustomList[];
  isLoading: boolean;
  isUpdating: boolean;
  isFavorite: (title: string) => boolean;
  toggleFavorite: (recommendation: Recommendation) => void;
  addToHistory: (recommendation: Recommendation) => void;
  addFeedback: (recommendation: Recommendation, liked: boolean) => void;
  getNewRecommendations: (preferences: PreferenceFormValues) => Promise<void>;
  clearRecommendations: () => void;
  createList: (name: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  addToList: (listId: string, recommendation: Recommendation) => Promise<void>;
  removeFromList: (listId: string, recommendationTitle: string) => Promise<void>;
}

const RecommendationContext = createContext<RecommendationContextType | undefined>(undefined);

export function useRecommendationContext() {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error('useRecommendationContext debe ser usado dentro de un RecommendationProvider');
  }
  return context;
}

export function RecommendationProvider({ children }: { children: ReactNode }) {
  const { userData, updateUserData } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const favorites = userData?.favorites || [];
  const history = userData?.history || [];
  const recommendations = userData?.recommendations || [];
  const lists = userData?.lists || [];

  const getNewRecommendations = useCallback(async (preferences: PreferenceFormValues) => {
    setIsLoading(true);
    try {
      const userFeedback = feedback.map(f => `Al usuario ${f.liked ? 'le gustó' : 'no le gustó'} "${f.recommendation.title}"`).join('. ');
      
      const mappedPreferences = {
        contentType: preferences.contentType,
        platformPreferences: preferences.platforms,
        genrePreferences: preferences.genres,
        durationPreference: preferences.duration,
        yearRangePreference: preferences.yearRange === "any" ? undefined : preferences.yearRange,
        episodesPreference: preferences.episodes,
        originCountryPreference: preferences.originCountry,
        languagePreference: preferences.language,
        subtitlesPreference: preferences.subtitles,
        dubbingPreference: preferences.dubbing,
        contentThemes: preferences.contentThemes || [],
        similarContent: preferences.similarContent || '',
        viewingHistory: history.map(item => item.title),
        feedback: userFeedback,
      };

      const newRecommendations = await improveRecommendations(mappedPreferences);
      
      if (newRecommendations && newRecommendations.length > 0) {
        await updateUserData({ recommendations: newRecommendations, preferences });
      } else {
        toast({
          variant: "destructive",
          title: "No se encontraron recomendaciones",
          description: "Intenta cambiar tus preferencias o vuelve a intentarlo.",
        });
        await updateUserData({ recommendations: [], preferences });
      }
    } catch (error) {
      console.error("Fallo al obtener recomendaciones de la IA:", error);
      toast({
        variant: "destructive",
        title: "Error al obtener recomendaciones",
        description: "Hubo un problema con la IA. Por favor, intenta de nuevo.",
      });
      await updateUserData({ recommendations: [] });
    } finally {
      setIsLoading(false);
    }
  }, [history, feedback, updateUserData]);

  const isFavorite = (title: string) => {
    return favorites.some(fav => fav.title === title);
  };

  const toggleFavorite = (recommendation: Recommendation) => {
    let updatedFavorites;
    if (isFavorite(recommendation.title)) {
      updatedFavorites = favorites.filter(fav => fav.title !== recommendation.title);
    } else {
      updatedFavorites = [recommendation, ...favorites];
    }
    updateUserData({ favorites: updatedFavorites });
  };

  const addToHistory = (recommendation: Recommendation) => {
    let updatedHistory;
    const exists = history.some(item => item.title === recommendation.title);
    if(exists) {
      const filteredHistory = history.filter(item => item.title !== recommendation.title);
      updatedHistory = [recommendation, ...filteredHistory];
    } else {
      updatedHistory = [recommendation, ...history];
    }
    updateUserData({ history: updatedHistory });
  };

  const addFeedback = (recommendation: Recommendation, liked: boolean) => {
    setFeedback(prevFeedback => {
      const newFeedback: Feedback = { recommendation, liked };
      const filteredFeedback = prevFeedback.filter(f => f.recommendation.title !== recommendation.title);
      return [newFeedback, ...filteredFeedback];
    });
  }

  const clearRecommendations = () => {
    updateUserData({ recommendations: [] });
  }

  // Lists Management
  const createList = async (name: string) => {
      setIsUpdating(true);
      const newList: CustomList = {
          id: uuidv4(),
          name,
          items: [],
          createdAt: Date.now(),
      };
      await updateUserData({ lists: [...lists, newList] });
      setIsUpdating(false);
  };

  const deleteList = async (listId: string) => {
      setIsUpdating(true);
      const updatedLists = lists.filter(list => list.id !== listId);
      await updateUserData({ lists: updatedLists });
      setIsUpdating(false);
  };

  const addToList = async (listId: string, recommendation: Recommendation) => {
      setIsUpdating(true);
      const updatedLists = lists.map(list => {
          if (list.id === listId) {
              const itemExists = list.items.some(item => item.title === recommendation.title);
              if (itemExists) {
                  toast({ variant: "default", title: "Ya existe", description: `"${recommendation.title}" ya está en la lista "${list.name}".`});
                  return list;
              }
              toast({ title: "¡Añadido!", description: `"${recommendation.title}" se ha añadido a la lista "${list.name}".`});
              return { ...list, items: [recommendation, ...list.items] };
          }
          return list;
      });
      await updateUserData({ lists: updatedLists });
      setIsUpdating(false);
  };

  const removeFromList = async (listId: string, recommendationTitle: string) => {
      setIsUpdating(true);
      const updatedLists = lists.map(list => {
          if (list.id === listId) {
              const updatedItems = list.items.filter(item => item.title !== recommendationTitle);
              return { ...list, items: updatedItems };
          }
          return list;
      });
      await updateUserData({ lists: updatedLists });
      setIsUpdating(false);
  };

  const value = {
    recommendations,
    favorites,
    history,
    feedback,
    lists: (userData?.lists || []).sort((a,b) => b.createdAt - a.createdAt),
    isLoading,
    isUpdating,
    isFavorite,
    toggleFavorite,
    addToHistory,
    addFeedback,
    getNewRecommendations,
    clearRecommendations,
    createList,
    deleteList,
    addToList,
    removeFromList,
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
}
