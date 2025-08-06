
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { List, Plus, Loader2, Trash2 } from "lucide-react";
import { useRecommendationContext } from "@/hooks/use-recommendation-context";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ListsPage() {
  const { lists, createList, deleteList, isUpdating } = useRecommendationContext();
  const [newListName, setNewListName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast({
        variant: "destructive",
        title: "El nombre no puede estar vacío",
      });
      return;
    }
    await createList(newListName.trim());
    toast({
      title: "¡Lista creada!",
      description: `La lista "${newListName.trim()}" ha sido creada.`,
    });
    setNewListName("");
    setIsDialogOpen(false);
  };

  const handleDeleteList = (listId: string) => {
    deleteList(listId);
     toast({
      title: "Lista eliminada",
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Mis Listas</h1>
          <p className="text-muted-foreground">
            Colecciones personalizadas de tu contenido favorito.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Crear Lista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nueva lista</DialogTitle>
              <DialogDescription>
                Dale un nombre a tu nueva colección de películas o series.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Ej: Noche de Pelis Familiares"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
            />
            <DialogFooter>
              <Button
                onClick={handleCreateList}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Crear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {lists.length === 0 ? (
        <Card className="flex items-center justify-center h-96 border-dashed">
          <CardContent className="text-center p-6">
            <List className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold font-headline">
              Aún no tienes listas
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Crea tu primera lista para empezar a organizar tu contenido.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {lists.map((list) => (
            <Card key={list.id} className="flex flex-col group">
                <CardHeader className="flex-row items-start justify-between">
                 <Link href={`/dashboard/lists/${list.id}`} className="flex-grow">
                    <CardTitle className="font-headline hover:underline cursor-pointer">
                        {list.name}
                    </CardTitle>
                  </Link>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>¿Seguro que quieres borrar la lista "{list.name}"?</AlertDialogTitle>
                              <AlertDialogDescription>Esta acción es permanente y no se puede deshacer.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteList(list.id)}>Borrar</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
              <CardContent className="flex-grow cursor-pointer" onClick={() => router.push(`/dashboard/lists/${list.id}`)}>
                <p className="text-sm text-muted-foreground">
                  {list.items.length} {list.items.length === 1 ? "elemento" : "elementos"}
                </p>
                 <div className="flex -space-x-4 mt-4 rtl:space-x-reverse">
                    {list.items.slice(0, 5).map((item, index) => (
                         <div key={index} className="w-12 h-16 bg-muted rounded border-2 border-background flex items-center justify-center">
                            <List className="w-6 h-6 text-muted-foreground/50"/>
                         </div>
                    ))}
                     {list.items.length > 5 && (
                        <div className="flex items-center justify-center w-12 h-16 font-bold text-sm border-2 rounded text-muted-foreground bg-muted">
                            +{list.items.length - 5}
                        </div>
                    )}
                 </div>
              </CardContent>
              <CardFooter>
                 <Button variant="secondary" className="w-full" asChild>
                    <Link href={`/dashboard/lists/${list.id}`}>Ver Lista</Link>
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
