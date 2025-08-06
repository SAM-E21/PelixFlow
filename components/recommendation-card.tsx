
"use client"
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Eye, Percent, MessageSquareQuote, Clapperboard, Trash2 } from 'lucide-react';
import type { ImproveRecommendationsOutput } from '@/ai/flows/improve-recommendations';
import { useRecommendationContext } from '@/hooks/use-recommendation-context';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { RecommendationDetailsDialog } from './recommendation-details-dialog';


type Recommendation = ImproveRecommendationsOutput[0];

export function RecommendationCard({ recommendation, listId }: { recommendation: Recommendation, listId?: string }) {
    const { isFavorite, toggleFavorite, addToHistory, removeFromList } = useRecommendationContext();
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const favorite = isFavorite(recommendation.title);

    const handleCardClick = () => {
        addToHistory(recommendation);
        setIsDetailsOpen(true);
    }
    
    const handleRemoveFromList = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(listId) {
            removeFromList(listId, recommendation.title);
        }
    }

    return (
        <>
            <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-primary/20 hover:scale-105 transition-all duration-300 rounded-lg border-border group">
                <CardHeader className="p-0 relative cursor-pointer aspect-[2/3] bg-muted flex items-center justify-center" onClick={handleCardClick}>
                    <Clapperboard className="w-16 h-16 text-muted-foreground/50"/>
                    {recommendation.confidenceScore && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white p-1 px-2 rounded-full text-xs font-bold">
                            <Percent className="h-3 w-3" />
                            <span>{recommendation.confidenceScore}%</span>
                        </div>
                    )}
                    {listId && (
                       <Button size="icon" variant="destructive" className="absolute top-2 left-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleRemoveFromList}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Quitar de la lista</span>
                       </Button>
                    )}
                </CardHeader>
                <CardContent className="p-4 flex-grow flex flex-col">
                    <CardTitle className="text-lg font-headline mb-2 truncate cursor-pointer hover:underline" title={recommendation.title} onClick={handleCardClick}>
                        {recommendation.title} ({recommendation.year})
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary">{recommendation.genre}</Badge>
                        <Badge style={{backgroundColor: '#B39DDB', color: '#2D2D2D'}}>{recommendation.platform}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{recommendation.synopsis}</p>
                    <p className="text-xs text-muted-foreground font-semibold">
                        Actores: <span className="font-normal">{recommendation.mainActors.join(', ')}</span>
                    </p>
                    
                    {recommendation.reviews && (
                        <Accordion type="single" collapsible className="w-full mt-2">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-sm py-2">
                                    <div className="flex items-center gap-2">
                                        <MessageSquareQuote className="h-4 w-4" />
                                        <span>Críticas y Reseñas</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-xs text-muted-foreground">
                                {recommendation.reviews}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                </CardContent>
                <CardFooter className="p-4 pt-0 flex gap-2 mt-auto">
                    <Button size="sm" className={cn("flex-1", favorite ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90")} onClick={() => toggleFavorite(recommendation)}>
                        <Star className="mr-2 h-4 w-4" />
                        {favorite ? "Quitar Favorito" : "Favorito"}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={handleCardClick}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                    </Button>
                </CardFooter>
            </Card>
            <RecommendationDetailsDialog
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                recommendation={recommendation}
            />
        </>
    );
}
