
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from '@/components/ui/checkbox';
import phoneData from '@/lib/phone_data.json';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Smartphone, Sparkles, Phone, Check, Loader2, Tag, LogIn, ChevronsUpDown, Send, Handshake, User as UserIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { createSellRequest } from '@/app/sell/actions';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';

const OTHER_VALUE = "__other__";

const deviceProblemsOptions = [
  "Faulty Back Camera", "Faulty Battery", "Faulty Front Camera", "Problems with Volume Button",
  "Problems with WiFi/GPS/Bluetooth", "Problem with Speaker", "Problem with Power/Home Button",
  "Problem with Charging", "Problem with Network/3G/4G", "Back Glass Broken", "Problem with Fingerprint Scanner",
  "Spen Not Working / Not Available", "Problem with Earphone Plug", "Problem with Fingerprint Scanner under Display",
  "Problem with Vibration", "Board Problem", "Phone Bend", "Face ID Not Working",
  "Problem with Proximity Sensor", "Problem with Microphone", "Problem with Silent Button", "None"
];

const accessoryOptions = ["Charger", "Cover", "Earphone", "Other"];

interface FormData {
  brand: string;
  customBrand: string;
  model: string;
  customModel: string;
  storage: string;
  ram: string;
  overallCondition: string;
  screenCondition: string;
  batteryHealth: string;
  age: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  socialMediaPlatform: string;
  socialMediaHandle: string;
  additionalInfo: string;
  deviceSwitchesOn: 'Yes' | 'No';
  isMDMSRegistered: 'Yes' | 'No';
  wasRepaired: 'Yes' | 'No';
  deviceProblems: string[];
  hasOriginalAccessories: string;
  accessories: string[];
  otherAccessory: string;
  hasPurchaseBill: string;
  accessoryDetails: string;
  imeiMatchesBox: string;
}

function SellPage() {
  const { isAuthenticated, user, getIdToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    brand: '', customBrand: '', model: '', customModel: '', storage: '', ram: '',
    overallCondition: '', screenCondition: '', batteryHealth: '', age: '',
    fullName: user?.displayName || '', phone: (user as any)?.phoneNumber || '', email: user?.email || '', location: '',
    socialMediaPlatform: '', socialMediaHandle: '',
    additionalInfo: '', deviceSwitchesOn: 'No', isMDMSRegistered: 'No', wasRepaired: 'No',
    deviceProblems: [], hasOriginalAccessories: '', accessories: [], otherAccessory: '',
    hasPurchaseBill: '', accessoryDetails: '', imeiMatchesBox: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [openBrandPopover, setOpenBrandPopover] = useState(false)
  const [openModelPopover, setOpenModelPopover] = useState(false)
  const totalSteps = 4; // Reduced to 4 steps
  const progress = Math.min((currentStep / totalSteps) * 100, 100);

  useEffect(() => {
    if (user) {
        setFormData(prev => ({
            ...prev,
            fullName: user.displayName || prev.fullName,
            email: user.email || prev.email,
        }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (fieldName: keyof FormData | string, value: string) => {
    if (fieldName === 'brand') {
      setFormData(prev => ({ ...prev, brand: value, model: '', customModel: '' }));
      setOpenBrandPopover(false);
    } else if (fieldName === 'model') {
        setFormData(prev => ({ ...prev, model: value }));
        setOpenModelPopover(false);
    }
     else {
      setFormData(prev => ({ ...prev, [fieldName as keyof FormData]: value }));
    }
  };

  const handleCheckboxChange = (fieldName: 'deviceProblems' | 'accessories', value: string, checked: boolean | 'indeterminate') => {
    setFormData(prev => {
      const current = prev[fieldName] as string[];
      if (fieldName === 'deviceProblems') {
        const noneSelected = value === 'None';
        const isNoneCurrentlySelected = current.includes('None');
        if (noneSelected) {
          return { ...prev, deviceProblems: checked ? ['None'] : [] };
        }
        if (isNoneCurrentlySelected) {
          return { ...prev, deviceProblems: checked ? [value] : [] };
        }
      }
      return {
        ...prev,
        [fieldName]: checked ? [...current, value] : current.filter(item => item !== value),
      };
    });
  };

  const brands = useMemo(() => Object.keys(phoneData), []);
  const models = useMemo(() => formData.brand && formData.brand !== OTHER_VALUE ? phoneData[formData.brand as keyof typeof phoneData] : [], [formData.brand]);

  const isStepValid = (step: number) => {
    const { brand, customBrand, model, customModel, storage, ram, fullName, phone, email, location } = formData;
    const finalBrand = brand === OTHER_VALUE ? customBrand : brand;
    const finalModel = model === OTHER_VALUE ? customModel : model;
    switch (step) {
      case 1: return !!finalBrand && !!finalModel && !!storage && (brand === 'Apple' || !!ram);
      case 2: return !!formData.deviceSwitchesOn && !!formData.isMDMSRegistered && !!formData.wasRepaired && !!formData.age;
      case 3: return !!formData.overallCondition && !!formData.screenCondition && !!formData.hasOriginalAccessories && !!formData.hasPurchaseBill && !!formData.imeiMatchesBox && formData.deviceProblems.length > 0 && (formData.hasOriginalAccessories === 'No' || formData.accessories.length > 0) && (!formData.accessories.includes('Other') || !!formData.otherAccessory);
      case 4: return !!fullName && !!phone && !!email && !!location;
      default: return false;
    }
  };

  const handleNextStep = () => {
    if (isStepValid(currentStep)) {
        setCurrentStep(currentStep + 1);
    } else {
      toast({ title: "Missing Fields", description: "Please fill in all required fields to continue.", variant: "destructive" });
    }
  };

  const handlePreviousStep = () => setCurrentStep(currentStep - 1);
  
  const handleFinalSubmit = async () => {
    if (!isStepValid(4)) {
       toast({ title: "Missing Fields", description: "Please fill in all required fields to continue.", variant: "destructive" });
       return;
    }
    
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to submit a request.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      const idToken = await getIdToken();
      if (!idToken) throw new Error("User not authenticated.");

      const data = new FormData();
      
      data.append('brand', formData.brand === OTHER_VALUE ? formData.customBrand : formData.brand);
      data.append('model', formData.model === OTHER_VALUE ? formData.customModel : formData.model);
      data.append('deviceSwitchesOn', String(formData.deviceSwitchesOn === 'Yes'));
      data.append('isMDMSRegistered', String(formData.isMDMSRegistered === 'Yes'));
      data.append('wasRepaired', String(formData.wasRepaired === 'Yes'));
      data.append('hasOriginalAccessories', String(formData.hasOriginalAccessories === 'Yes'));
      data.append('hasPurchaseBill', String(formData.hasPurchaseBill === 'Yes'));
      data.append('imeiMatchesBox', String(formData.imeiMatchesBox === 'Yes'));
      
      // Defaulting to pending on initial submission
      data.append('status', 'pending');

      // Append simple key-value pairs
      const simpleFields: (keyof FormData)[] = ['storage', 'ram', 'overallCondition', 'screenCondition', 'batteryHealth', 'age', 'fullName', 'phone', 'email', 'location', 'socialMediaPlatform', 'socialMediaHandle', 'additionalInfo', 'otherAccessory', 'accessoryDetails'];
      simpleFields.forEach(key => {
        const value = formData[key as keyof typeof formData];
        if (value && typeof value === 'string') {
          data.append(key, value);
        }
      });
      
      if (formData.deviceProblems.length > 0) {
        data.append('deviceProblems', formData.deviceProblems.join(','));
      }
      if (formData.accessories.length > 0) {
        data.append('accessories', formData.accessories.join(','));
      }
      
      const result = await createSellRequest(idToken, data);
      
      if (result.success) {
        toast({ title: "Request Submitted!", description: "Thank you! Our team will review your request and contact you with a quote soon." });
        router.push('/account/sells');
      } else {
        throw new Error(result.message || "An unknown error occurred on the server.");
      }

    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message || "Could not submit your request. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const overallConditions = ['Excellent', 'Very Good', 'Good', 'Fair'];
  const overallConditionDetails: { [key: string]: string } = { 'Excellent': 'Like new, no visible wear', 'Very Good': 'Minor wear, fully functional', 'Good': 'Visible wear, works perfectly', 'Fair': 'Heavy wear, may have issues' };
  const screenConditions = ['Perfect', 'Minor Scratches', 'Deep Scratches', 'Broken/Cracked', 'Discolored', 'Patches', 'Screen Burn', 'Changed'];
  const batteryHealthOptions = ['100%', '90-99%', '80-89%', '<80%'];
  const yesNoOptions = ['Yes', 'No'];
  const storageOptions = ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];
  const ramOptions = ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'];
  
  if (!isAuthenticated) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <Smartphone className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">Get a Quote for Your Phone</h2>
              <p className="text-muted-foreground">Please log in to submit your device for a quote.</p>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg">
                <Link href="/auth/login?redirect=/sell"><LogIn className="mr-2 h-4 w-4" /> Login to Continue</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const finalBrand = formData.brand === OTHER_VALUE ? formData.customBrand : formData.brand;
    switch (currentStep) {
      case 1: return <Step1 formData={formData} handleSelectChange={handleSelectChange} handleInputChange={handleInputChange} brands={brands} models={models} storageOptions={storageOptions} ramOptions={ramOptions} openBrandPopover={openBrandPopover} setOpenBrandPopover={setOpenBrandPopover} openModelPopover={openModelPopover} setOpenModelPopover={setOpenModelPopover} />;
      case 2: return <Step2 formData={formData} handleSelectChange={handleSelectChange} handleInputChange={handleInputChange} yesNoOptions={yesNoOptions} />;
      case 3: return <Step3 formData={formData} finalBrand={finalBrand} handleSelectChange={handleSelectChange} handleCheckboxChange={handleCheckboxChange} handleInputChange={handleInputChange} overallConditions={overallConditions} overallConditionDetails={overallConditionDetails} screenConditions={screenConditions} batteryHealthOptions={batteryHealthOptions} deviceProblemsOptions={deviceProblemsOptions} accessoryOptions={accessoryOptions} yesNoOptions={yesNoOptions} />;
      case 4: return <Step4ContactInfo formData={formData} handleInputChange={handleInputChange} handleFinalSubmit={handleFinalSubmit} isSubmitting={isSubmitting} />;
      default: return null;
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-2xl">
          {currentStep <= totalSteps && (
            <CardHeader>
              <div className='flex justify-between items-center mb-1 text-sm text-muted-foreground'>
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
          )}
          <CardContent className="p-6">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {renderContent()}
              <div className="flex justify-between pt-4">
                {currentStep > 1 && <Button type="button" onClick={handlePreviousStep} variant="outline" disabled={isLoading || isSubmitting}>Previous</Button> }
                {currentStep < totalSteps && <Button type="button" onClick={handleNextStep} className="ml-auto" disabled={!isStepValid(currentStep) || isLoading || isSubmitting}>Next Step <ArrowRight className="ml-2 h-4 w-4" /></Button>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Breaking down steps into components for clarity

const Step1 = ({ formData, handleSelectChange, handleInputChange, brands, models, storageOptions, ramOptions, openBrandPopover, setOpenBrandPopover, openModelPopover, setOpenModelPopover }: any) => (
    <>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary"><Smartphone className="h-8 w-8" /></div>
        <h2 className="text-xl font-bold">Tell us about your phone</h2>
        <p className="text-sm text-muted-foreground">Basic information to get started</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand">Brand <span className="text-red-500">*</span></Label>
            <Popover open={openBrandPopover} onOpenChange={setOpenBrandPopover}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">{formData.brand ? (formData.brand === OTHER_VALUE ? 'Other (Specify)' : formData.brand) : "Select your phone brand"} <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command><CommandInput placeholder="Search brand..." /><CommandEmpty>No brand found.</CommandEmpty><CommandList><CommandGroup>
                        {brands.map((b: string) => (<CommandItem key={b} value={b} onSelect={() => { handleSelectChange('brand', b); }}><Check className={cn("mr-2 h-4 w-4", formData.brand === b ? "opacity-100" : "opacity-0")}/>{b}</CommandItem>))}
                        <CommandItem key={OTHER_VALUE} value={OTHER_VALUE} onSelect={() => { handleSelectChange('brand', OTHER_VALUE); }}><Check className={cn("mr-2 h-4 w-4", formData.brand === OTHER_VALUE ? "opacity-100" : "opacity-0")}/>Other (Specify)</CommandItem>
                    </CommandGroup></CommandList></Command>
                </PopoverContent>
            </Popover>
          {formData.brand === OTHER_VALUE && (<Input name="customBrand" className="mt-2" placeholder="Enter brand name" value={formData.customBrand} onChange={handleInputChange} />)}
        </div>
        <div>
          <Label htmlFor="model">Model <span className="text-red-500">*</span></Label>
          {formData.brand && formData.brand !== OTHER_VALUE ? (
             <Popover open={openModelPopover} onOpenChange={setOpenModelPopover}>
                <PopoverTrigger asChild><Button variant="outline" role="combobox" className="w-full justify-between" disabled={!formData.brand || formData.brand === OTHER_VALUE}>{formData.model ? (formData.model === OTHER_VALUE ? 'Other (not listed)' : formData.model) : "Select your phone model"}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search model..." /><CommandEmpty>No model found.</CommandEmpty><CommandList><CommandGroup>
                    {models.map((m: string) => ( <CommandItem key={m} value={m} onSelect={() => { handleSelectChange('model', m); }}><Check className={cn("mr-2 h-4 w-4", formData.model === m ? "opacity-100" : "opacity-0")}/>{m}</CommandItem>))}
                    <CommandItem key={OTHER_VALUE} value={OTHER_VALUE} onSelect={() => { handleSelectChange('model', OTHER_VALUE); }}><Check className={cn("mr-2 h-4 w-4", formData.model === OTHER_VALUE ? "opacity-100" : "opacity-0")}/>Other (not listed)</CommandItem>
                </CommandGroup></CommandList></Command></PopoverContent>
             </Popover>
          ) : (<Input name="model" placeholder="e.g., iPhone 14 Pro, Galaxy S23" value={formData.model} onChange={handleInputChange} required disabled={!formData.brand} />)}
          {formData.model === OTHER_VALUE && (<Input name="customModel" className="mt-2" placeholder="Enter model name" value={formData.customModel} onChange={handleInputChange} />)}
        </div>
        <div>
          <Label htmlFor="storage">Storage <span className="text-red-500">*</span></Label>
          <Select onValueChange={(value) => handleSelectChange('storage', value)} value={formData.storage}><SelectTrigger id="storage"><SelectValue placeholder="Select storage" /></SelectTrigger><SelectContent>{storageOptions.map((v: string) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select>
        </div>
        {formData.brand !== 'Apple' && (
          <div>
            <Label htmlFor="ram">RAM</Label>
            <Select onValueChange={(value) => handleSelectChange('ram', value)} value={formData.ram}><SelectTrigger id="ram"><SelectValue placeholder="Select RAM" /></SelectTrigger><SelectContent>{ramOptions.map((r: string) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
          </div>
        )}
      </div>
    </>
);

const Step2 = ({ formData, handleSelectChange, handleInputChange, yesNoOptions }: any) => (
    <>
        <div className="text-center mb-6"><div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary"><Smartphone className="h-8 w-8" /></div><h2 className="text-xl font-bold">Device History and Status</h2><p className="text-sm text-muted-foreground">Provide details about your device's history</p></div>
        <div className="space-y-4">
            <div><Label>Does Your Device Switch On? <span className="text-red-500">*</span></Label><Select onValueChange={(value) => handleSelectChange('deviceSwitchesOn', value)} value={formData.deviceSwitchesOn}><SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger><SelectContent>{yesNoOptions.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Is Your Device MDMS Registered? <span className="text-red-500">*</span></Label><Select onValueChange={(value) => handleSelectChange('isMDMSRegistered', value)} value={formData.isMDMSRegistered}><SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger><SelectContent>{yesNoOptions.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Have your device been repaired? <span className="text-red-500">*</span></Label><Select onValueChange={(value) => handleSelectChange('wasRepaired', value)} value={formData.wasRepaired}><SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger><SelectContent>{yesNoOptions.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div><Label htmlFor="age">Age of Device (in years) <span className="text-red-500">*</span></Label><Input id="age" name="age" placeholder="e.g., 2" type="number" min="0" value={formData.age} onChange={handleInputChange} required /></div>
        </div>
    </>
);

const Step3 = ({ formData, finalBrand, handleSelectChange, handleCheckboxChange, handleInputChange, overallConditions, overallConditionDetails, screenConditions, batteryHealthOptions, deviceProblemsOptions, accessoryOptions, yesNoOptions }: any) => (
     <>
        <div className="text-center mb-6"><div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary"><Sparkles className="h-8 w-8" /></div><h2 className="text-xl font-bold">Condition Assessment</h2><p className="text-sm text-muted-foreground">Help us determine the right price for your device</p></div>
        <div className="space-y-6">
            <div><Label>Overall Condition <span className="text-red-500">*</span></Label><div className="grid grid-cols-2 gap-2 mt-2">{overallConditions.map((c: string) => (<button key={c} type="button" className={`p-3 text-left rounded-md border text-sm ${formData.overallCondition === c ? 'border-primary ring-2 ring-primary' : 'hover:bg-accent'}`} onClick={() => handleSelectChange('overallCondition', c)}><p className="font-semibold">{c}</p><p className="text-xs text-muted-foreground">{overallConditionDetails[c]}</p></button>))}</div></div>
            <div><Label>Screen Condition <span className="text-red-500">*</span></Label><Select onValueChange={(value) => handleSelectChange('screenCondition', value)} value={formData.screenCondition}><SelectTrigger><SelectValue placeholder="Select screen condition" /></SelectTrigger><SelectContent>{screenConditions.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            {finalBrand === 'Apple' ? (<div><Label>Battery Health</Label><Select onValueChange={(value) => handleSelectChange('batteryHealth', value)} value={formData.batteryHealth}><SelectTrigger><SelectValue placeholder="Battery condition" /></SelectTrigger><SelectContent>{batteryHealthOptions.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>) : (<div><Label>How Old is your Battery? <span className="text-red-500">*</span></Label><Select onValueChange={(value) => handleSelectChange('batteryHealth', value)} value={formData.batteryHealth}><SelectTrigger><SelectValue placeholder="Select battery age" /></SelectTrigger><SelectContent><SelectItem value="0-6 months">0-6 months</SelectItem><SelectItem value="6-12 months">6-12 months</SelectItem><SelectItem value="1-2 years">1-2 years</SelectItem><SelectItem value="2-3 years">2-3 years</SelectItem><SelectItem value="3-4 years">3-4 years</SelectItem><SelectItem value="4-5 years">4-5 years</SelectItem></SelectContent></Select></div>)}
            <div><Label>Please Select the Device Problems <span className="text-red-500">*</span></Label><div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">{deviceProblemsOptions.map((p: string) => (<div key={p} className="flex items-center space-x-2"><Checkbox id={p} checked={formData.deviceProblems.includes(p)} onCheckedChange={(checked) => handleCheckboxChange('deviceProblems', p, checked)} /><Label htmlFor={p} className="font-normal">{p}</Label></div>))}</div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Original Accessories? <span className="text-red-500">*</span></Label><Select onValueChange={(value) => handleSelectChange('hasOriginalAccessories', value)} value={formData.hasOriginalAccessories}><SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger><SelectContent>{yesNoOptions.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                    {formData.hasOriginalAccessories === 'Yes' && (<div className="mt-2 space-y-2"><Label>Select Accessories <span className="text-red-500">*</span></Label>{accessoryOptions.map((acc: string) => (<div key={acc} className="flex items-center space-x-2"><Checkbox id={acc} checked={formData.accessories.includes(acc)} onCheckedChange={(checked) => handleCheckboxChange('accessories', acc, checked)} /><Label htmlFor={acc} className="font-normal">{acc}</Label></div>))}{formData.accessories.includes('Other') && (<Input name="otherAccessory" placeholder="Specify other" value={formData.otherAccessory} onChange={handleInputChange} className="mt-2" />)}</div>)}
                </div>
                <div><Label>Purchase Bill Available? <span className="text-red-500">*</span></Label><Select onValueChange={(value) => handleSelectChange('hasPurchaseBill', value)} value={formData.hasPurchaseBill}><SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger><SelectContent>{yesNoOptions.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>IMEI Matches Box? <span className="text-red-500">*</span></Label><Select onValueChange={(value) => handleSelectChange('imeiMatchesBox', value)} value={formData.imeiMatchesBox}><SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger><SelectContent>{yesNoOptions.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label htmlFor="accessoryDetails">Accessory Details</Label><Textarea id="accessoryDetails" name="accessoryDetails" placeholder="e.g., Includes original charger, third-party earphones." value={formData.accessoryDetails} onChange={handleInputChange} /><p className="text-xs text-muted-foreground mt-1">Provide details about the condition and type of included accessories.</p></div>
            <div>
              <Label htmlFor="additionalInfo">Additional Details</Label>
              <Textarea id="additionalInfo" name="additionalInfo" placeholder="Describe any issues not visible in photos, like minor scratches, screen burn, loose buttons, etc." value={formData.additionalInfo} onChange={handleInputChange} />
            </div>
        </div>
    </>
);

const Step4ContactInfo = ({ formData, handleInputChange, handleFinalSubmit, isSubmitting }: any) => (
    <>
        <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary"><UserIcon className="h-8 w-8" /></div>
            <h2 className="text-xl font-bold">Your Contact Information</h2>
            <p className="text-sm text-muted-foreground">Please provide your details so we can reach out with a quote.</p>
        </div>
        <div className="space-y-4">
            <div><Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label><Input id="fullName" name="fullName" placeholder="Your full name" value={formData.fullName} onChange={handleInputChange} required /></div>
            <div><Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label><Input id="phone" name="phone" placeholder="+977 9XXXXXXXXX" value={formData.phone} onChange={handleInputChange} required /></div>
            <div><Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label><Input id="email" name="email" type="email" placeholder="your.email@example.com" value={formData.email} onChange={handleInputChange} required /></div>
            <div><Label htmlFor="location">Location <span className="text-red-500">*</span></Label><Input id="location" name="location" placeholder="City, Nepal" value={formData.location} onChange={handleInputChange} required /></div>
        </div>
        <Button onClick={handleFinalSubmit} className="w-full !mt-6" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Submitting...</> : <>Submit Request for Quote <Send className="ml-2 h-4 w-4"/></>}
        </Button>
    </>
);

export default SellPage;

