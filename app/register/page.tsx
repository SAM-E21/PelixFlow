
"use client";

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
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Update Firebase Auth profile
      await updateProfile(user, { displayName: name });
      
      // 3. Create user document in Firestore (Firebase)
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
      });

      // 4. Handle Supabase logic
      try {
        const { data: existingUser, error: findError } = await supabase
          .from('Universal')
          .select('id_PelixFlow')
          .eq('email', email)
          .single();

        if (findError && findError.code !== 'PGRST116') { // PGRST116: "Exactly one row is expected, but 0 or more than 1 were returned"
            throw findError;
        }

        if (!existingUser) {
            const newPelixFlowId = uuidv4();
            const { error: insertError } = await supabase
                .from('Universal')
                .insert({ email: email, id_PelixFlow: newPelixFlowId });
            
            if(insertError) throw insertError;

            await setDoc(doc(db, "users", user.uid), {
                id_PelixFlow: newPelixFlowId,
            }, { merge: true });

        } else {
             await setDoc(doc(db, "users", user.uid), {
                id_PelixFlow: existingUser.id_PelixFlow,
            }, { merge: true });
        }
      } catch(supabaseError: any) {
          console.error("Supabase error during registration:", supabaseError);
          // We can decide if this should be a critical error that stops the user
          // For now, we'll just log it and show a non-blocking toast.
          toast({
              variant: "destructive",
              title: "Error de sincronización",
              description: "No se pudo crear el ID universal, pero tu cuenta fue creada.",
          });
      }


      toast({
        title: "¡Cuenta creada con éxito!",
        description: "Ya puedes iniciar sesión.",
      });

      router.push("/dashboard");

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error al crear la cuenta",
        description: error.message || "Hubo un problema. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center space-y-4">
            <Logo className="h-10 w-auto mx-auto"/>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-headline">Crear Cuenta</CardTitle>
              <CardDescription>
                Ingresa tus datos para registrarte
              </CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Max"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin"/> : "Crear Cuenta"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/" className="underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
