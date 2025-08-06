
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, User, Send, BrainCircuit, Heart, Plus, Sparkles, MessageSquare, Trash2, Combine, Loader2, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox";
import { useRecommendationContext } from "@/hooks/use-recommendation-context";
import { useChatContext } from "@/hooks/use-chat-context";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation";


function ConversationsList({ activeChat, chats, startNewChat, deleteChat, deleteAllChats, onChatSelect }: any) {
    const getChatIcon = (title: string) => {
        if (title.toLowerCase().includes('análisis')) return BrainCircuit;
        if (title.toLowerCase().includes('fusión')) return Combine;
        if (title.toLowerCase().includes('recomendaciones')) return Sparkles;
        return MessageSquare;
    }

    const router = useRouter();

    const handleSelectChat = (chatId: string) => {
        router.push(`/dashboard/chat?id=${chatId}`);
        if(onChatSelect) {
            onChatSelect();
        }
    }
    
    const handleStartNewChat = () => {
        const newChatId = startNewChat("Nuevo Chat");
        router.push(`/dashboard/chat?id=${newChatId}`);
         if(onChatSelect) {
            onChatSelect();
        }
    }

    return (
        <Card className="flex flex-col h-full border-0 md:border">
            <CardHeader>
                <CardTitle className="font-headline">Conversaciones</CardTitle>
                <CardDescription>Tu historial de chats.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-2">
                <Button className="w-full mb-4" onClick={handleStartNewChat}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Chat
                </Button>
                <div className="space-y-1">
                    {chats.map((chat: any) => {
                        const Icon = getChatIcon(chat.title);
                        return (
                            <div key={chat.id} className={cn(
                                "flex items-start justify-between gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors",
                                activeChat?.id === chat.id && "bg-muted"
                            )} onClick={() => handleSelectChat(chat.id)}>
                                <div className="flex items-start gap-3 flex-grow min-w-0">
                                    <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                                    <div className="flex-grow min-w-0">
                                        <p className="font-semibold text-sm truncate">{chat.title}</p>
                                        <p className="text-xs text-muted-foreground truncate">{chat.messages[chat.messages.length - 1]?.text || "..."}</p>
                                    </div>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                            <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Seguro que quieres borrar este chat?</AlertDialogTitle>
                                            <AlertDialogDescription>Esta acción es permanente y no se puede deshacer.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}>Borrar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
            <CardContent className="border-t pt-4">
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full" disabled={chats.length === 0}>
                            <Trash2 className="mr-2 h-4 w-4" /> Borrar Historial
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Seguro que quieres borrar todo el historial?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción es permanente y no se puede deshacer. Se borrarán todas tus conversaciones.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={deleteAllChats}>Borrar Todo</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}


export default function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTitle = searchParams.get('title');
    const chatIdFromParams = searchParams.get('id');

    const {
        chats,
        activeChat,
        activeChatId,
        startNewChat,
        deleteChat,
        deleteAllChats,
        setActiveChatId,
        sendMessageToChat,
        isSending,
        createFusion,
    } = useChatContext();

    const [input, setInput] = useState("");
    const [persona, setPersona] = useState("experto"); // experto | fan
    const { recommendations, favorites, history } = useRecommendationContext();
    const allContent = [...recommendations, ...favorites, ...history];
    const uniqueContent = allContent.filter((v, i, a) => a.findIndex(t => (t.title === v.title)) === i)
    const [selectedToFuse, setSelectedToFuse] = useState<string[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Effect to set the active chat from URL params
    useEffect(() => {
        if (chatIdFromParams) {
            setActiveChatId(chatIdFromParams);
        }
    }, [chatIdFromParams, setActiveChatId]);

    // Effect to handle chat creation and redirection
    useEffect(() => {
        // If there's a title and no specific chat ID, create a new chat for it
        if (initialTitle && !chatIdFromParams) {
            const existingChat = chats.find(c => c.title === `Análisis de '${initialTitle}'`);
            if (!existingChat) {
                const newChatId = startNewChat(`Análisis de '${initialTitle}'`, [{ from: "bot", text: `¡Hola! Veo que quieres hablar sobre '${initialTitle}'. ¿Qué te gustaría saber?` }]);
                router.replace(`/dashboard/chat?id=${newChatId}`);
            }
        } 
        // If there's no active chat ID, redirect to the latest chat or create a new one
        else if (!activeChatId) {
            if (chats.length > 0) {
                const latestChat = chats.sort((a,b) => b.createdAt - a.createdAt)[0];
                if (latestChat) router.replace(`/dashboard/chat?id=${latestChat.id}`);
            } else {
                const newChatId = startNewChat("Nuevo Chat");
                router.replace(`/dashboard/chat?id=${newChatId}`);
            }
        }
    }, [initialTitle, chatIdFromParams, activeChatId, chats, startNewChat, router]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeChat?.messages]);


    const handleSend = async () => {
        if (input.trim() && activeChat && !isSending) {
            const currentInput = input;
            setInput("");
            await sendMessageToChat(currentInput, persona as 'experto' | 'fan', initialTitle || undefined);
        }
    };
    
    const handleFusion = async () => {
        if (selectedToFuse.length < 2 || selectedToFuse.length > 3) {
            toast({
                variant: "destructive",
                title: "Selección inválida",
                description: "Por favor, selecciona 2 o 3 títulos para fusionar.",
            });
            return;
        }
        await createFusion(selectedToFuse);
        setSelectedToFuse([]);
    }
    
     const handleCheckboxChange = (title: string) => {
        setSelectedToFuse(prev => {
            if (prev.includes(title)) {
                return prev.filter(t => t !== title);
            } else {
                if(prev.length < 3) return [...prev, title];
                else {
                     toast({
                        title: "Límite alcanzado",
                        description: "Puedes seleccionar un máximo de 3 títulos para fusionar.",
                     });
                     return prev;
                }
            }
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-[calc(100vh-8rem)] gap-6">
            <div className="hidden md:block h-full">
                <ConversationsList 
                    activeChat={activeChat}
                    chats={chats}
                    startNewChat={startNewChat}
                    deleteChat={deleteChat}
                    deleteAllChats={deleteAllChats}
                />
            </div>
            
            <Card className="flex flex-col h-full">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                 <Button variant="outline" size="icon" className="md:hidden">
                                    <PanelLeft className="h-5 w-5" />
                                    <span className="sr-only">Abrir conversaciones</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-full max-w-sm sm:w-full">
                                <ConversationsList
                                    activeChat={activeChat}
                                    chats={chats}
                                    startNewChat={startNewChat}
                                    deleteChat={deleteChat}
                                    deleteAllChats={deleteAllChats}
                                    onChatSelect={() => setIsSheetOpen(false)}
                                />
                            </SheetContent>
                        </Sheet>
                        <div>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <MessageSquare className="h-6 w-6" /> {activeChat?.title || "Chat"}
                            </CardTitle>
                            <CardDescription>
                                Chatea con la IA sobre tus películas y series favoritas.
                            </CardDescription>
                        </div>
                    </div>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary" disabled={!activeChat}><Combine className="mr-2 h-4 w-4"/> Fusionar</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="font-headline">Fusionar Contenido</DialogTitle>
                                <DialogDescription>
                                    Selecciona 2 o 3 títulos y la IA creará una recomendación única basada en la combinación.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 max-h-80 overflow-y-auto my-4 pr-2">
                               {uniqueContent.map(item => (
                                 <div key={item.title} className="flex items-center space-x-2">
                                    <Checkbox id={item.title} onCheckedChange={() => handleCheckboxChange(item.title)} checked={selectedToFuse.includes(item.title)} />
                                    <label
                                        htmlFor={item.title}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                       {item.title}
                                    </label>
                                </div>
                               ))}
                            </div>
                            <DialogFooter>
                                <Button onClick={handleFusion} disabled={isSending || selectedToFuse.length < 2 || !activeChat}>
                                    {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                    Fusionar y obtener recomendación
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>

                <CardContent className="flex-grow overflow-y-auto p-6 space-y-6">
                     {!activeChat ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">Selecciona un chat</h3>
                                <p className="mt-1 text-sm text-muted-foreground">O crea uno nuevo para empezar a conversar.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeChat.messages.map((msg, index) => (
                                <div key={index} className={cn("flex items-start gap-4", msg.from === "user" && "justify-end")}>
                                    {msg.from === "bot" && <Bot className="h-8 w-8 text-primary flex-shrink-0" />}
                                    <div className={cn("max-w-xl p-3 rounded-lg", msg.from === "bot" ? "bg-muted" : "bg-primary text-primary-foreground")}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    {msg.from === "user" && <User className="h-8 w-8 text-muted-foreground flex-shrink-0" />}
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex items-center gap-4">
                                    <Bot className="h-8 w-8 text-primary flex-shrink-0 animate-pulse" />
                                    <div className="bg-muted p-3 rounded-lg">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </CardContent>

                <CardContent className="border-t pt-4">
                     <div className="flex items-center gap-4 mb-4">
                        <p className="text-sm font-medium">Personalidad de la IA:</p>
                        <Select value={persona} onValueChange={setPersona} disabled={isSending}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecciona personalidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="experto">
                                <div className="flex items-center gap-2"><BrainCircuit/> Experto</div>
                            </SelectItem>
                            <SelectItem value="fan">
                               <div className="flex items-center gap-2"><Heart/> Fan</div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Escribe tu mensaje..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend();
                            }}
                            disabled={!activeChat || isSending}
                        />
                        <Button onClick={handleSend} disabled={!activeChat || isSending || !input.trim()}><Send className="h-4 w-4" /></Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    