
"use client";

import Link from "next/link";
import { Leaf, Loader2, Eye, EyeOff, User, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as React from "react";
import { FirebaseError } from "firebase/app";
import { AnimatePresence, motion } from "framer-motion";

const SignupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, "A valid phone number is required.").regex(/^\+?[0-9\s-()]+$/, "Invalid phone number format."),
  password: z.string()
    .min(6, "Password must be at least 6 characters.")
    .max(12, "Password must be at most 12 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

function getPasswordErrorMessage(error: FirebaseError): string {
    if (error.code === 'auth/email-already-in-use') {
        return "This email is already registered. Please log in.";
    }
    if (error.code === 'auth/weak-password') {
        return "The password is too weak. Please choose a stronger password.";
    }
    // Generic fallback for other auth errors
    return "Could not create account. Please check your details and try again.";
}

const Step1 = ({ control, handleNextStep }: { control: any, handleNextStep: () => void }) => (
    <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} transition={{ duration: 0.3 }}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Account Details</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField control={control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input placeholder="m@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl><Input type="tel" placeholder="+977..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <Button type="button" className="w-full" onClick={handleNextStep}>Next</Button>
      </CardContent>
    </motion.div>
  );

const Step2 = ({ control, formState: { errors, isSubmitting }, handlePreviousStep }: { control: any, formState: any, handlePreviousStep: () => void }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    return (
      <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} transition={{ duration: 0.3 }}>
        <CardHeader className="relative text-center">
           <Button variant="ghost" size="icon" className="absolute left-2 top-2" onClick={handlePreviousStep}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex items-center justify-center gap-3">
            <Lock className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Security</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField control={control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} {...field} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <ul className="text-xs list-disc pl-5 mt-2 text-muted-foreground">
                <li className={errors.password?.message?.includes("uppercase") ? 'text-destructive' : ''}>Must contain an uppercase letter.</li>
                <li className={errors.password?.message?.includes("number") ? 'text-destructive' : ''}>Must contain a numeric character.</li>
                <li className={errors.password?.message?.includes("6 characters") || errors.password?.message?.includes("12 characters") ? 'text-destructive' : ''}>Must be between 6 and 12 characters.</li>
              </ul>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name="confirmPassword" render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showConfirmPassword ? "text" : "password"} {...field} />
                   <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(p => !p)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creating Account...</> : 'Create Account'}
          </Button>
        </CardContent>
      </motion.div>
    );
};

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = React.useState(1);

  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: ""
    },
    mode: 'onBlur',
  });

  const { trigger, control, formState } = form;

  const handleNextStep = async () => {
    const fieldsToValidate: ('name' | 'email' | 'phone')[] = ['name', 'email', 'phone'];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleSignup = async (values: z.infer<typeof SignupSchema>) => {
    try {
      await signup(values.name, values.email, values.phone, values.password);
      toast({ 
          title: "Verification Email Sent!",
          description: "Your account has been created. Please check your email to activate it before logging in.",
          duration: 6000,
       });
      router.push("/auth/login");
    } catch (error: any) {
      console.error(error);
      const description = getPasswordErrorMessage(error as FirebaseError);
      toast({ title: "Signup failed", description, variant: "destructive" });
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-lg text-primary mb-4">
            <Leaf className="h-7 w-7" />
            <span className="text-2xl font-bold text-foreground">Eco-Fone Nepal</span>
          </Link>
        <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">Join our community of smart, sustainable shoppers.</CardDescription>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSignup)}>
          <AnimatePresence mode="wait">
            {step === 1 ? <Step1 key="step1" control={control} handleNextStep={handleNextStep} /> : <Step2 key="step2" control={control} formState={formState} handlePreviousStep={handlePreviousStep} />}
          </AnimatePresence>
        </form>
      </FormProvider>
      <CardContent className="mt-4">
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

