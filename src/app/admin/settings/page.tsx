
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";
import React, { useEffect, useState, useTransition } from "react";
import { getSettings } from "@/lib/settings";
import { updateSiteSettings, updateAdminSettings } from "./actions";
import type { SiteSettings } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { getAdminSettings } from "@/lib/users";

export default function SettingsPage() {
    const { isMasterAdmin } = useAuth();
    const [settings, setSettings] = useState<Partial<SiteSettings>>({});
    const [adminSettings, setAdminSettings] = useState({ esewaMobileNumber: '' });
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        const loadSettings = async () => {
            setLoading(true);
            const [fetchedSettings, fetchedAdminSettings] = await Promise.all([
                getSettings(),
                getAdminSettings()
            ]);
            setSettings(fetchedSettings);
            if (fetchedAdminSettings) {
                setAdminSettings({ esewaMobileNumber: fetchedAdminSettings.esewaMobileNumber || '' });
            }
            setLoading(false);
        };
        loadSettings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAdminSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const formData = new FormData(e.target as HTMLFormElement);
            
            const promises = [updateSiteSettings(formData)];
            if(isMasterAdmin) {
                promises.push(updateAdminSettings(formData));
            }
            
            const results = await Promise.all(promises);

            const siteResult = results[0];
            if (siteResult.success) {
                toast({ title: "Success!", description: siteResult.message });
            } else {
                toast({ title: "Error", description: siteResult.message, variant: "destructive" });
            }

            if(results.length > 1) {
                const adminResult = results[1];
                 if (adminResult.success) {
                    toast({ title: "Success!", description: adminResult.message });
                } else {
                    toast({ title: "Error", description: adminResult.message, variant: "destructive" });
                }
            }
        });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your store settings and preferences.</p>
            </div>
            
            <form onSubmit={handleSaveSettings}>
                 {isMasterAdmin && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Master Admin Settings</CardTitle>
                            <CardDescription>High-level settings only available to Master Admins.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="esewaMobileNumber">eSewa Mobile Number</Label>
                                <Input id="esewaMobileNumber" name="esewaMobileNumber" type="text" value={adminSettings.esewaMobileNumber} onChange={handleAdminInputChange} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Store Information</CardTitle>
                        <CardDescription>Update your store's public details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="storeName">Store Name</Label>
                            <Input id="storeName" name="storeName" value={settings.storeName || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Contact Email</Label>
                            <Input id="contactEmail" name="contactEmail" type="email" value={settings.contactEmail || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Contact Phone Number</Label>
                            <Input id="contactPhone" name="contactPhone" type="tel" value={settings.contactPhone || ''} onChange={handleInputChange} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Social Media Links</CardTitle>
                        <CardDescription>Enter the full URLs for your social profiles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="socialFacebook">Facebook URL</Label>
                            <Input id="socialFacebook" name="socialFacebook" placeholder="https://facebook.com/yourpage" value={settings.socialFacebook || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="socialInstagram">Instagram URL</Label>
                            <Input id="socialInstagram" name="socialInstagram" placeholder="https://instagram.com/yourprofile" value={settings.socialInstagram || ''} onChange={handleInputChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="socialX">X (Twitter) URL</Label>
                            <Input id="socialX" name="socialX" placeholder="https://x.com/yourhandle" value={settings.socialX || ''} onChange={handleInputChange} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Shipping Options</CardTitle>
                        <CardDescription>Configure shipping rates and zones.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="insideValleyRate">Inside Valley Rate (NPR)</Label>
                            <Input id="insideValleyRate" name="insideValleyRate" type="number" value={settings.insideValleyRate || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="outsideValleyRate">Outside Valley Rate (NPR)</Label>
                            <Input id="outsideValleyRate" name="outsideValleyRate" type="number" value={settings.outsideValleyRate || ''} onChange={handleInputChange} />
                        </div>
                    </CardContent>
                </Card>
                
                <Button type="submit" className="mt-8" disabled={isPending}>
                    {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save All Settings"}
                </Button>
            </form>
        </div>
    );
}
