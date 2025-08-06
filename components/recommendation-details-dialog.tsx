
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import type { ImproveRecommendationsOutput } from "@/ai/flows/improve-recommendations";
import { Award, Clapperboard, Film, Languages, Map, Star, Tv, Users, Calendar, ExternalLink, MessageSquare, Youtube, ThumbsUp, ThumbsDown, Info, ShieldCheck, ListPlus } from "lucide-react";
import { useRecommendationContext } from "@/hooks/use-recommendation-context";
import { useToast } from "@/hooks/use-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Recommendation = ImproveRecommendationsOutput[0];

interface RecommendationDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  recommendation: Recommendation | null;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | string[] | null }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-muted-foreground text-sm">
            {Array.isArray(value) ? value.join(', ') : value}
        </p>
      </div>
    </div>
  );
};

export function RecommendationDetailsDialog({ isOpen, onOpenChange, recommendation }: RecommendationDetailsDialogProps) {
  const { addFeedback, lists, addToList, isUpdating } = useRecommendationContext();
  const { toast } = useToast();
  
  if (!recommendation) return null;

  const handleFeedback = (liked: boolean) => {
    addFeedback(recommendation, liked);
    toast({
      title: "¡Gracias por tu opinión!",
      description: `"${recommendation.title}" ha sido guardado en tu historial de feedback.`,
    });
  }

  const handleAddToList = async (listId: string) => {
    await addToList(listId, recommendation);
  }

  const getIcon = (type?: string) => {
    switch(type?.toLowerCase()){
        case 'película': return Film;
        case 'serie': return Tv;
        case 'documental': return Clapperboard;
        default: return Film;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline">{recommendation.title}</DialogTitle>
          <DialogDescription>{recommendation.year} &middot; {recommendation.genre}</DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-6 -mr-6 grid md:grid-cols-[300px_1fr] gap-8">
            <div className="space-y-4">
                 <div className="w-full aspect-[2/3] bg-muted rounded-md flex items-center justify-center">
                    <Film className="w-24 h-24 text-muted-foreground/50" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {recommendation.directLink && recommendation.directLink !== "#" && (
                        <Button className="w-full" asChild>
                            <Link href={recommendation.directLink} target="_blank">
                                Ver en {recommendation.platform} <ExternalLink className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                    )}
                     {recommendation.trailerUrl && (
                        <Button className="w-full" variant="secondary" asChild>
                            <Link href={recommendation.trailerUrl} target="_blank">
                                Ver Tráiler <Youtube className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button className="w-full" variant="outline" asChild>
                        <Link href={`/dashboard/chat?title=${encodeURIComponent(recommendation.title)}`}>
                            <MessageSquare className="mr-2 h-4 w-4"/> Chatear
                        </Link>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="w-full" variant="outline" disabled={isUpdating}>
                                <ListPlus className="mr-2 h-4 w-4" />
                                Añadir a lista
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {lists.length > 0 ? (
                                lists.map(list => (
                                    <DropdownMenuItem key={list.id} onSelect={() => handleAddToList(list.id)}>
                                        {list.name}
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <DropdownMenuItem disabled>No tienes listas creadas</DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <h3 className="font-headline text-lg mb-2">Sinopsis</h3>
                    <p className="text-sm text-muted-foreground">{recommendation.synopsis}</p>
                </div>

                <Separator/>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-2 text-sm">
                    <DetailItem icon={getIcon(recommendation.contentType)} label="Tipo" value={recommendation.contentType} />
                    <DetailItem icon={Calendar} label="Año" value={recommendation.year} />
                    <DetailItem icon={Award} label="Género" value={recommendation.genre} />
                    <DetailItem icon={Star} label="Puntuaciones" value={recommendation.ratings} />
                    <DetailItem icon={Film} label="Director" value={recommendation.director} />
                    <DetailItem icon={MessageSquare} label="Escritor" value={recommendation.writer} />
                    <DetailItem icon={Map} label="País" value={recommendation.originCountry} />
                    <DetailItem icon={Languages} label="Idioma" value={recommendation.language} />
                    <DetailItem icon={ShieldCheck} label="Clasificación" value={recommendation.contentRating} />
                    {recommendation.contentType?.toLowerCase() === 'serie' && (
                       <DetailItem icon={Info} label="Temporadas" value={recommendation.seasons} />
                    )}
                </div>
                
                <Separator/>

                <DetailItem icon={Users} label="Elenco Principal" value={recommendation.mainActors} />
                <DetailItem icon={Award} label="Premios" value={recommendation.awards} />

                <Separator/>

                <div className="space-y-4">
                    <h3 className="font-headline text-lg">Críticas y Reseñas</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md">{recommendation.reviews}</p>
                </div>

                <Separator/>

                <div>
                    <h3 className="font-headline text-lg mb-2">¿Ya la viste?</h3>
                    <p className="text-sm text-muted-foreground mb-3">Tu opinión nos ayuda a mejorar futuras recomendaciones.</p>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => handleFeedback(true)}>
                            <ThumbsUp className="mr-2 h-4 w-4 text-green-500" />
                            Me gustó
                        </Button>
                         <Button variant="outline" onClick={() => handleFeedback(false)}>
                            <ThumbsDown className="mr-2 h-4 w-4 text-red-500" />
                            No me gustó
                        </Button>
                    </div>
                </div>

            </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
