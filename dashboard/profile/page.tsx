
"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";

export default function ProfilePage() {
  const { user, userData, reloadUserData } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setEmail(userData.email || "");
      setProfileImageUrl(userData.photoURL || null);
    }
  }, [userData]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Failed to get canvas context'));
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality JPEG
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const compressedDataUrl = await compressImage(file);
        setProfileImageUrl(compressedDataUrl);
      } catch (error) {
        console.error("Error compressing image:", error);
        toast({
          variant: "destructive",
          title: "Error al procesar imagen",
          description: "No se pudo comprimir la imagen. Intenta con otra."
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const userDocRef = doc(db, "users", user.uid);
      
      const updatedData: { name: string; email: string; photoURL?: string | null } = {
        name,
        email,
        photoURL: profileImageUrl,
      };

      // Use setDoc with merge: true to create the doc if it doesn't exist, or update it if it does.
      await setDoc(userDocRef, updatedData, { merge: true });
      
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          // The dataURL is too long for the auth profile, so we only store it in Firestore.
          // photoURL: profileImageUrl, 
        });
      }

      await reloadUserData();

      toast({
        title: "¡Cambios guardados!",
        description: "Tu perfil ha sido actualizado correctamente.",
      });
    } catch (error: any) {
      console.error("Error al guardar cambios:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message || "Hubo un problema al actualizar tu perfil.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
    const getInitials = (nameStr: string) => {
    if (!nameStr) return 'U';
    return nameStr.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Tu Perfil</h1>
        <p className="text-muted-foreground">
          Visualiza y actualiza la información de tu cuenta.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Información Personal</CardTitle>
          <CardDescription>
            Estos datos son privados y no se compartirán con nadie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage src={profileImageUrl || undefined} alt="Foto de perfil de usuario" />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={handleButtonClick} disabled={isLoading}>
              Cambiar foto
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/png, image/jpeg, image/gif"
            />
          </div>

          <Separator />

          <form onSubmit={handleSaveChanges} className="space-y-6 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled // Email is not editable for now
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Cambios
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-destructive">
            Zona de Peligro
          </CardTitle>
          <CardDescription>
            Acciones permanentes y destructivas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled={isLoading}>Eliminar mi cuenta</Button>
          <p className="text-sm text-muted-foreground mt-2">
            Esta acción no se puede deshacer. Se borrarán permanentemente todos
            tus datos, incluyendo favoritos e historial.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
