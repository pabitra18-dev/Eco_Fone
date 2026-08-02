import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Mail } from "lucide-react";
import Link from "next/link";

export function ContactSection() {
  return (
    <div className="mt-16 text-center">
      <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 text-primary">
        <MessageSquare className="h-8 w-8" />
      </div>
      <h2 className="text-3xl font-bold">Still Need Help?</h2>
      <div className="flex justify-center">
        <p className="mt-2 text-muted-foreground max-w-xl text-center">
          Can't find what you're looking for? Our customer support team is here to help with any questions.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
        <Card className="text-left bg-primary/5 dark:bg-primary/10 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold flex items-center gap-2 text-primary"><Phone className="h-4 w-4" />Phone Support</h3>
            <p className="font-semibold mt-2">+977-9820736354</p>
            <p className="text-xs text-muted-foreground mt-1">Monday-Friday, 9 AM - 6 PM</p>
          </CardContent>
        </Card>
        <Card className="text-left bg-muted/50 dark:bg-muted/30 border-border">
           <CardContent className="p-6">
            <h3 className="font-semibold flex items-center gap-2"><Mail className="h-4 w-4 text-primary"/>Email Support</h3>
            <p className="font-semibold mt-2">ecofonenepal@gmail.com</p>
            <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8 flex justify-center gap-4">
          <Button asChild>
            <Link href="/faq">Contact Support</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account/orders">Track Order</Link>
          </Button>
      </div>
    </div>
  )
}
