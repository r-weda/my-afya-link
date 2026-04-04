import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";

const feedbackSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const categories = [
  { value: "feedback", label: "General Feedback" },
  { value: "suggestion", label: "Suggestion" },
  { value: "complaint", label: "Complaint" },
  { value: "question", label: "Question" },
  { value: "support", label: "Support Request" },
];

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: "",
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: FeedbackFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("feedback" as any).insert({
        category: values.category,
        name: values.name,
        email: values.email,
        subject: values.subject,
        message: values.message,
      } as any);

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "Thank you!", description: "Your feedback has been submitted successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.reset();
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader title="Feedback & Contact" />

      <main className="px-4 pt-6 max-w-lg md:max-w-2xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg md:text-xl lg:text-2xl text-foreground">
              We'd love to hear from you
            </h1>
            <p className="text-xs lg:text-sm text-muted-foreground">
              Share feedback, ask a question, or report an issue
            </p>
          </div>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="elevated-card rounded-2xl p-8 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl lg:text-2xl text-foreground">Thank You!</h2>
            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
              Your message has been received. We'll get back to you as soon as possible.
            </p>
            <Button onClick={handleReset} className="rounded-xl h-11 lg:h-12 lg:text-base">
              Submit Another
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="lg:text-sm">Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-11 lg:h-12 lg:text-base">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value} className="lg:text-base">
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name & Email row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="lg:text-sm">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" className="rounded-xl h-11 lg:h-12 lg:text-base" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="lg:text-sm">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@email.com" className="rounded-xl h-11 lg:h-12 lg:text-base" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Subject */}
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="lg:text-sm">Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief subject" className="rounded-xl h-11 lg:h-12 lg:text-base" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Message */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="lg:text-sm">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us more..."
                          className="rounded-xl resize-none min-h-[120px] lg:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto h-12 lg:h-12 rounded-xl font-semibold lg:text-base lg:px-8"
                >
                  {loading ? "Submitting..." : "Send Message"}
                  <Send className="w-4 h-4 lg:w-5 lg:h-5 ml-2" />
                </Button>
              </form>
            </Form>
          </motion.div>
        )}
      </main>

      <div className="flex-1" />
      <Footer />
      <BottomNav />
    </div>
  );
}
