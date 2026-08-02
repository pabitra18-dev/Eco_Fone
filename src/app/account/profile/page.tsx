
"use client";

import { useState, ChangeEvent, useTransition, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfile } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
    const { user, isAuthenticated, getIdToken } = useAuth();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement>(null);

    const [name, setName] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if(user) {
            setName(user.displayName || "");
            setPreviewUrl(user.photoURL || null);
        }
    }, [user]);

    if (isAuthenticated === null) {
        return <div>Loading profile...</div>;
    }

    if (!user) {
        return <div>Please log in to see your profile.</div>;
    }

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const idToken = await getIdToken();
        if(!idToken || !formRef.current) {
            toast({ title: "Error", description: "Authentication failed or form not found. Please log in again.", variant: "destructive" });
            return;
        }

        const formData = new FormData(formRef.current);
        formData.append('currentPhotoUrl', user.photoURL || '');

        startTransition(async () => {
            const result = await updateUserProfile(idToken, formData);
            if(result.success) {
                toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
                // We might need to manually trigger a refresh of the user object in the auth context
                // For now, a page reload is a simple way to see the change
                window.location.reload();
            } else {
                toast({ title: "Update Failed", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                    <CardDescription>View and manage your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={previewUrl || user.photoURL || undefined} alt={user.displayName || 'User'} />
                            <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                                <h2 className="text-2xl font-semibold">{user.displayName || "User"}</h2>
                                <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    <form ref={formRef} className="space-y-4 pt-4" onSubmit={handleFormSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="profileImage">Profile Picture</Label>
                            <Input id="profileImage" name="profileImage" type="file" accept="image/*" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setPreviewUrl(URL.createObjectURL(file));
                                }
                            }} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user.email || ""} disabled />
                        </div>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Profile"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
