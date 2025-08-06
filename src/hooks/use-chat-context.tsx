
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from './use-toast';
import { chatWithAi } from '@/ai/flows/chat-with-ai';
import { fuseContent } from '@/ai/flows/fuse-content';
import { useAuth } from './use-auth';

export type Message = {
    from: "user" | "bot";
    text: string;
}

export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  activeChatId: string | null;
  isSending: boolean;
  startNewChat: (title?: string, initialMessages?: Message[]) => string;
  deleteChat: (chatId: string) => void;
  deleteAllChats: () => void;
  setActiveChatId: (chatId: string | null) => void;
  sendMessageToChat: (userInput: string, persona: 'experto' | 'fan', contentTitle?: string) => Promise<void>;
  createFusion: (titles: string[]) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext debe ser usado dentro de un ChatProvider');
  }
  return context;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { userData, updateUserData } = useAuth();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const chats = userData?.chats || [];
  
  const setChats = (newChats: Chat[] | ((prevChats: Chat[]) => Chat[])) => {
      const finalChats = typeof newChats === 'function' ? newChats(userData?.chats || []) : newChats;
      updateUserData({ chats: finalChats });
  };
  
  const activeChat = chats.find(chat => chat.id === activeChatId) || null;

  useEffect(() => {
    if (activeChatId && !chats.some(c => c.id === activeChatId)) {
        const latestChat = chats.sort((a, b) => b.createdAt - a.createdAt)[0];
        setActiveChatId(latestChat ? latestChat.id : null);
    }
  }, [activeChatId, chats]);


  const startNewChat = useCallback((title: string = "Nuevo Chat", initialMessages?: Message[]): string => {
    const newChat: Chat = {
        id: uuidv4(),
        title,
        messages: initialMessages || [{ from: 'bot', text: '¡Hola! Soy tu asistente de cine. ¿Sobre qué quieres hablar hoy?' }],
        createdAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, [setChats]);

  const deleteChat = (chatId: string) => {
    const remainingChats = (userData?.chats || []).filter(chat => chat.id !== chatId);
    setChats(remainingChats);
    if (activeChatId === chatId) {
        if (remainingChats.length > 0) {
            const nextActiveChat = remainingChats.sort((a,b) => b.createdAt - a.createdAt)[0];
            setActiveChatId(nextActiveChat.id);
        } else {
            setActiveChatId(null);
        }
    }
  };

  const deleteAllChats = () => {
    setChats([]);
    setActiveChatId(null);
  };
  
  const sendMessageToChat = useCallback(async (userInput: string, persona: 'experto' | 'fan', contentTitle?: string) => {
    if (!activeChatId) return;

    const userMessage: Message = { from: "user", text: userInput };
    
    setChats(prev => prev.map(chat => 
        chat.id === activeChatId 
            ? { ...chat, messages: [...chat.messages, userMessage] } 
            : chat
    ));
    
    setIsSending(true);

    try {
        const currentChat = (userData?.chats || []).find(c => c.id === activeChatId);
        if (!currentChat) throw new Error("Chat no encontrado");

        const aiResponse = await chatWithAi({
            history: currentChat.messages,
            userInput: userInput,
            persona: persona,
            contentTitle: contentTitle
        });

        const botMessage: Message = { from: "bot", text: aiResponse.response };
        
        setChats(prev => prev.map(chat => 
            chat.id === activeChatId 
                ? { ...chat, messages: [...chat.messages, botMessage] } 
                : chat
        ));

    } catch(error) {
         console.error("Error al chatear con la IA", error);
        toast({
            variant: "destructive",
            title: "Error en el chat",
            description: "Hubo un problema al conectar con la IA. Inténtalo de nuevo.",
        });
        const errorMessage: Message = { from: "bot", text: "Lo siento, tuve un problema para procesar tu mensaje." };
         setChats(prev => prev.map(chat => 
            chat.id === activeChatId 
                ? { ...chat, messages: [...chat.messages, errorMessage] } 
                : chat
        ));
    } finally {
        setIsSending(false);
    }
  }, [activeChatId, userData, setChats]);
  
   const createFusion = useCallback(async (titles: string[]) => {
    let fusionChatId = activeChatId;
    if (!fusionChatId) {
        fusionChatId = startNewChat(`Fusión: ${titles.join(' + ')}`, []);
    }

    const fusionRequestText = `Fusionando ${titles.join(', ')}...`;
    const fusionMessage: Message = { from: 'bot', text: fusionRequestText };

    setChats(prev => prev.map(chat =>
      chat.id === fusionChatId ? { ...chat, messages: [...chat.messages, fusionMessage] } : chat
    ));
    setIsSending(true);

    try {
      const fusionResult = await fuseContent({ titles });
      const botMessage: Message = { from: 'bot', text: fusionResult.recommendation };

      setChats(prev => prev.map(chat => {
        if (chat.id === fusionChatId) {
          const updatedMessages = chat.messages.filter(m => m.text !== fusionRequestText);
          return { ...chat, title: `Fusión: ${titles.join(' + ')}`, messages: [...updatedMessages, botMessage] };
        }
        return chat;
      }));
    } catch (error) {
      console.error("Error al fusionar contenido", error);
      toast({
        variant: "destructive",
        title: "Error en la fusión",
        description: "Hubo un problema al generar la fusión. Inténtalo de nuevo.",
      });
      const errorMessage: Message = { from: 'bot', text: "Lo siento, no pude crear una fusión con esos títulos." };
       setChats(prev => prev.map(chat => {
        if (chat.id === fusionChatId) {
            const updatedMessages = chat.messages.filter(m => m.text !== fusionRequestText);
            return { ...chat, messages: [...updatedMessages, errorMessage] };
        }
        return chat;
       }));
    } finally {
      setIsSending(false);
    }
  }, [activeChatId, setChats, startNewChat]);


  const value = {
    chats: (userData?.chats || []).sort((a, b) => b.createdAt - a.createdAt),
    activeChat,
    activeChatId,
    isSending,
    startNewChat,
    deleteChat,
    deleteAllChats,
    setActiveChatId,
    sendMessageToChat,
    createFusion
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
