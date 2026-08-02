
"use client";

import { Switch } from "@/components/ui/switch";
import { toggleFeaturedProductAction, setHeroProductAction } from "@/app/admin/homepage/actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { Button } from "../ui/button";

export function FeaturedProductToggle({ id, isFeatured }: { id: string, isFeatured: boolean }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [checked, setChecked] = useState(isFeatured);

    const handleToggle = (featured: boolean) => {
        setChecked(featured);
        startTransition(async () => {
            const result = await toggleFeaturedProductAction(id, featured);
            if (!result.success) {
                setChecked(!featured); // Revert on failure
                toast({
                    title: "Error",
                    description: "Failed to update featured status.",
                    variant: "destructive",
                });
            } else {
                 toast({
                    title: "Success",
                    description: `Product is now ${featured ? 'featured' : 'not featured'}.`,
                });
            }
        });
    };

    return <Switch checked={checked} onCheckedChange={handleToggle} disabled={isPending} />;
}

export function HeroProductButton({ id, isHero }: { id: string, isHero: boolean }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleSetHero = () => {
        startTransition(async () => {
            const result = await setHeroProductAction(id);
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Homepage hero product has been updated.",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Button
            onClick={handleSetHero}
            disabled={isPending || isHero}
            variant={isHero ? "default" : "outline"}
            size="sm"
        >
            {isPending ? 'Setting...' : (isHero ? 'Current Hero' : 'Set as Hero')}
        </Button>
    );
}
