import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, FileSpreadsheet, CheckCircle, AlertCircle, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface CsvRow {
  name: string;
  address: string;
  city: string;
  county?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  operating_hours?: string;
  services?: string;
  latitude?: string;
  longitude?: string;
  description?: string;
}

export default function CsvClinicImport({ onImportComplete }: { onImportComplete: () => void }) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);

  const parseCsv = (text: string): CsvRow[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_").replace(/"/g, ""));
    return lines.slice(1).map((line) => {
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = (values[i] || "").replace(/^"|"$/g, "").trim();
      });
      return obj as CsvRow;
    });
  };

  const validateRows = (data: CsvRow[]): { valid: CsvRow[]; errs: string[] } => {
    const errs: string[] = [];
    const valid = data.filter((row, i) => {
      if (!row.name) { errs.push(`Row ${i + 2}: missing name`); return false; }
      if (!row.address) { errs.push(`Row ${i + 2}: missing address`); return false; }
      if (!row.city) { errs.push(`Row ${i + 2}: missing city`); return false; }
      return true;
    });
    return { valid, errs };
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setErrors([]);
    setRows([]);
    setImportedCount(0);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsv(text);
      const { valid, errs } = validateRows(parsed);
      setRows(valid);
      setErrors(errs);
      setParsing(false);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    setProgress(0);
    let imported = 0;
    const batchSize = 50;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize).map((r) => ({
        name: r.name,
        address: r.address,
        city: r.city,
        county: r.county || null,
        phone_number: r.phone_number || null,
        email: r.email || null,
        website: r.website || null,
        operating_hours: r.operating_hours || null,
        services: r.services ? r.services.split(";").map((s) => s.trim()).filter(Boolean) : null,
        latitude: r.latitude ? parseFloat(r.latitude) : null,
        longitude: r.longitude ? parseFloat(r.longitude) : null,
        description: r.description || null,
        is_verified: true,
      }));

      const { error } = await supabase.from("clinics").insert(batch);
      if (error) {
        toast({ title: "Import error", description: error.message, variant: "destructive" });
        break;
      }
      imported += batch.length;
      setProgress(Math.round((imported / rows.length) * 100));
    }

    setImportedCount(imported);
    setImporting(false);
    setRows([]);
    toast({ title: `${imported} clinics imported!` });
    onImportComplete();
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadTemplate = () => {
    const header = "name,address,city,county,phone_number,email,website,operating_hours,services,latitude,longitude,description";
    const example = '"Kenyatta National Hospital","Hospital Rd","Nairobi","Nairobi","+254-20-2726300","info@knh.or.ke","https://knh.or.ke","Mon-Sun: 24 Hours","Emergency;Surgery;Pediatrics",-1.3009,36.8065,"National referral hospital"';
    const blob = new Blob([header + "\n" + example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clinics_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="elevated-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Bulk CSV Import</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7 rounded-lg" onClick={downloadTemplate}>
          <Download className="w-3 h-3 mr-1" /> Template
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Upload a CSV with columns: <code className="text-[10px] bg-secondary px-1 py-0.5 rounded">name, address, city, county, phone_number, email, website, operating_hours, services (semicolon-separated), latitude, longitude, description</code>
      </p>

      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="hidden"
      />

      <Button
        variant="outline"
        className="w-full rounded-xl h-10 border-dashed"
        onClick={() => fileRef.current?.click()}
        disabled={parsing || importing}
      >
        {parsing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
        {parsing ? "Parsing..." : "Select CSV File"}
      </Button>

      <AnimatePresence>
        {rows.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-health-green" />
              <span className="font-medium">{rows.length} valid rows</span>
              {errors.length > 0 && (
                <span className="text-xs text-destructive">({errors.length} skipped)</span>
              )}
            </div>

            {importing && <Progress value={progress} className="h-2 rounded-full" />}

            <Button
              onClick={handleImport}
              disabled={importing}
              className="w-full rounded-xl h-10"
            >
              {importing ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Importing {progress}%</>
              ) : (
                <>Import {rows.length} Clinics</>
              )}
            </Button>
          </motion.div>
        )}

        {errors.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1 max-h-24 overflow-y-auto">
            {errors.slice(0, 5).map((e, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-destructive">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{e}</span>
              </div>
            ))}
            {errors.length > 5 && <p className="text-xs text-muted-foreground">...and {errors.length - 5} more</p>}
          </motion.div>
        )}

        {importedCount > 0 && !importing && rows.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-health-green">
            <CheckCircle className="w-4 h-4" />
            Successfully imported {importedCount} clinics
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
