import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !type || !message) return;
    setSubmitted(true);
  };

  return (
    <section className="py-12 md:py-16 px-5 md:px-12 lg:px-16" style={{ backgroundColor: "#f0fdfa" }}>
      <div className="max-w-lg md:max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-xl md:text-2xl lg:text-3xl text-foreground mb-2">
            We'd love your feedback
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Help us improve AfyaConnect for all Kenyans
          </p>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="font-display font-semibold text-lg text-foreground">
                Thank you! We'll review your feedback shortly.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="fb-name" className="text-xs font-medium">Name</Label>
                <Input
                  id="fb-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-xl h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fb-email" className="text-xs font-medium">Email</Label>
                <Input
                  id="fb-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-xl h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Feedback Type</Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="clinic">Clinic Suggestion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fb-message" className="text-xs font-medium">Message</Label>
                <Textarea
                  id="fb-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="rounded-xl resize-none"
                  rows={4}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full md:w-auto h-12 rounded-xl font-semibold"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Feedback
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
