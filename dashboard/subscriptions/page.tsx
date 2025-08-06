
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Check, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Gratis",
    price: "$0",
    description: "Para empezar a descubrir.",
    features: [
      "10 recomendaciones al mes",
      "Búsqueda básica",
      "Guardar en favoritos",
    ],
    isCurrent: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    description: "Para el cinéfilo entusiasta.",
    features: [
      "Recomendaciones ilimitadas",
      "Búsqueda avanzada por IA",
      "Chat con la IA (Experto)",
      "Sin anuncios",
    ],
    isCurrent: true,
  },
  {
    name: "Premium",
    price: "$19.99",
    description: "La experiencia definitiva.",
    features: [
      "Todo lo del plan Pro",
      "Chat con la IA (Experto y Fan)",
      "Función de Fusión de contenido",
      "Acceso anticipado a nuevas funciones",
    ],
    isCurrent: false,
  },
];

export default function SubscriptionsPage() {
  const [currentPlan, setCurrentPlan] = useState("Pro");

  const handlePlanChange = (planName: string) => {
    setCurrentPlan(planName);
    toast({
        title: "¡Plan actualizado!",
        description: `Ahora estás en el plan ${planName}.`,
    })
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Suscripciones</h1>
        <p className="text-muted-foreground">
          Elige el plan que mejor se adapte a tus necesidades.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "flex flex-col transition-all",
              currentPlan === plan.name && "border-primary ring-2 ring-primary"
            )}
          >
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                {plan.name === "Gratis" && <Star className="text-muted-foreground"/>}
                {plan.name === "Pro" && <Zap className="text-primary"/>}
                {plan.name === "Premium" && <Zap className="text-yellow-500"/>}
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={currentPlan === plan.name}
                onClick={() => handlePlanChange(plan.name)}
              >
                {currentPlan === plan.name ? "Plan Actual" : "Seleccionar Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
