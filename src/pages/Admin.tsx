import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  ArrowLeft, FileText, MapPin, Calendar, Plus, Loader2,
  Trash2, CheckCircle, Users
} from "lucide-react";

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <h2 className="font-display font-bold text-xl text-foreground mb-2">Access Denied</h2>
        <p className="text-sm text-muted-foreground mb-4 text-center">You don't have admin privileges.</p>
        <Button onClick={() => navigate("/")} className="rounded-xl">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-lg">Admin Dashboard</h1>
        </div>
      </header>

      <main className="px-4 py-4 max-w-2xl mx-auto">
        <Tabs defaultValue="articles" className="space-y-4">
          <TabsList className="w-full rounded-xl bg-secondary/50 p-1 h-auto">
            <TabsTrigger value="articles" className="rounded-lg text-xs flex-1 py-2">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Articles
            </TabsTrigger>
            <TabsTrigger value="clinics" className="rounded-lg text-xs flex-1 py-2">
              <MapPin className="w-3.5 h-3.5 mr-1.5" /> Clinics
            </TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-lg text-xs flex-1 py-2">
              <Calendar className="w-3.5 h-3.5 mr-1.5" /> Appointments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles"><AdminArticles /></TabsContent>
          <TabsContent value="clinics"><AdminClinics /></TabsContent>
          <TabsContent value="appointments"><AdminAppointments /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function AdminArticles() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchArticles = async () => {
    const { data } = await supabase.from("health_articles").select("*").order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const { error } = await supabase.from("health_articles").insert({
      title,
      slug,
      summary,
      content,
      source: source || "AfyaConnect",
      image_url: imageUrl || null,
      is_published: false,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Article created!" });
      resetForm();
      fetchArticles();
    }
    setSubmitting(false);
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("health_articles").update({
      is_published: !current,
      published_at: !current ? new Date().toISOString() : null,
    }).eq("id", id);
    fetchArticles();
  };

  const deleteArticle = async (id: string) => {
    await supabase.from("health_articles").delete().eq("id", id);
    fetchArticles();
  };

  const resetForm = () => {
    setShowForm(false);
    setTitle("");
    setSummary("");
    setContent("");
    setSource("");
    setImageUrl("");
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} className="w-full rounded-xl h-10">
        {showForm ? "Cancel" : <><Plus className="w-4 h-4 mr-1" /> New Article</>}
      </Button>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleCreate} className="elevated-card rounded-2xl p-4 space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl h-10" required /></div>
          <div className="space-y-1.5"><Label className="text-xs">Summary</Label><Input value={summary} onChange={(e) => setSummary(e.target.value)} className="rounded-xl h-10" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} className="rounded-xl min-h-[100px]" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Source</Label><Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="WHO, MOH..." className="rounded-xl h-10" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Image URL</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="rounded-xl h-10" /></div>
          </div>
          <Button type="submit" disabled={submitting} className="w-full rounded-xl h-10">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Create Article
          </Button>
        </motion.form>
      )}

      <div className="space-y-2">
        {articles.map((a) => (
          <div key={a.id} className="elevated-card rounded-xl p-3 flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-3">
              <h4 className="text-sm font-semibold truncate">{a.title}</h4>
              <p className="text-xs text-muted-foreground">{a.source || "No source"}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <Switch checked={a.is_published} onCheckedChange={() => togglePublish(a.id, a.is_published)} />
                <span className="text-[10px] text-muted-foreground">{a.is_published ? "Live" : "Draft"}</span>
              </div>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => deleteArticle(a.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {articles.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No articles yet</p>}
      </div>
    </div>
  );
}

function AdminClinics() {
  const { toast } = useToast();
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Nairobi");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");

  const fetchClinics = async () => {
    const { data } = await supabase.from("clinics").select("*").order("created_at", { ascending: false });
    setClinics(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchClinics(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("clinics").insert({
      name,
      address,
      city,
      phone_number: phone || null,
      operating_hours: hours || null,
      description: description || null,
      is_verified: false,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Clinic added!" });
      setShowForm(false);
      setName("");
      setAddress("");
      setCity("Nairobi");
      setPhone("");
      setHours("");
      setDescription("");
      fetchClinics();
    }
    setSubmitting(false);
  };

  const toggleVerify = async (id: string, current: boolean) => {
    await supabase.from("clinics").update({ is_verified: !current }).eq("id", id);
    fetchClinics();
  };

  const deleteClinic = async (id: string) => {
    await supabase.from("clinics").delete().eq("id", id);
    fetchClinics();
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} className="w-full rounded-xl h-10">
        {showForm ? "Cancel" : <><Plus className="w-4 h-4 mr-1" /> Add Clinic</>}
      </Button>

      {showForm && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleCreate} className="elevated-card rounded-2xl p-4 space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-10" required /></div>
          <div className="space-y-1.5"><Label className="text-xs">Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl h-10" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl h-10" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254..." className="rounded-xl h-10" /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Operating Hours</Label><Input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Mon-Fri 8am-5pm" className="rounded-xl h-10" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl min-h-[60px]" /></div>
          <Button type="submit" disabled={submitting} className="w-full rounded-xl h-10">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Add Clinic
          </Button>
        </motion.form>
      )}

      <div className="space-y-2">
        {clinics.map((c) => (
          <div key={c.id} className="elevated-card rounded-xl p-3 flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold truncate">{c.name}</h4>
                {c.is_verified && <Badge variant="secondary" className="text-[9px] bg-health-green/10 text-health-green">Verified</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{c.address}, {c.city}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="icon" className="w-8 h-8 text-health-green" onClick={() => toggleVerify(c.id, c.is_verified)}>
                <CheckCircle className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => deleteClinic(c.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {clinics.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No clinics yet</p>}
      </div>
    </div>
  );
}

function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, notes, user_id, clinics(name)")
        .order("appointment_date", { ascending: false });
      
      // Fetch profile names for each appointment
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((a: any) => a.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", userIds);
        
        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
        const enriched = data.map((a: any) => ({
          ...a,
          profile: profileMap.get(a.user_id) || null,
        }));
        setAppointments(enriched);
      } else {
        setAppointments(data || []);
      }
      
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-2">
      {appointments.map((a) => (
        <div key={a.id} className="elevated-card rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {a.profile?.first_name || "Unknown"} {a.profile?.last_name || ""}
              </span>
            </div>
            <Badge variant="outline" className={`text-[10px] ${
              a.status === "confirmed" ? "bg-health-green/10 text-health-green" :
              a.status === "cancelled" ? "bg-destructive/10 text-destructive" :
              "bg-warning/10 text-warning"
            }`}>
              {a.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{a.clinics?.name} • {new Date(a.appointment_date).toLocaleDateString("en-KE")} at {a.appointment_time}</p>
        </div>
      ))}
      {appointments.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No appointments</p>}
    </div>
  );
}
