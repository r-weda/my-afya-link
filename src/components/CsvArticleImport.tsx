import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CsvArticleImportProps {
  onImportComplete: () => void;
}

interface ParsedArticle {
  title: string;
  slug: string;
  summary: string;
  content: string;
  source: string;
  image_url: string;
  is_published: boolean;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

export default function CsvArticleImport({ onImportComplete }: CsvArticleImportProps) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ imported: number; errors: number; errorMessages: string[] } | null>(null);

  const downloadTemplate = () => {
    const header = "title,summary,content,source,image_url,is_published";
    const example =
      '"Understanding Flu","A guide to flu prevention","Full article content here with **markdown** support.","WHO Kenya","https://example.com/image.jpg","true"';
    const blob = new Blob([header + "\n" + example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "articles_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setResult(null);

    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) {
      toast({ title: "Error", description: "CSV must have a header row and at least one data row.", variant: "destructive" });
      setImporting(false);
      return;
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
    const titleIdx = headers.indexOf("title");
    const contentIdx = headers.indexOf("content");

    if (titleIdx === -1 || contentIdx === -1) {
      toast({ title: "Error", description: "CSV must have 'title' and 'content' columns.", variant: "destructive" });
      setImporting(false);
      return;
    }

    const summaryIdx = headers.indexOf("summary");
    const sourceIdx = headers.indexOf("source");
    const imageIdx = headers.indexOf("image_url");
    const publishedIdx = headers.indexOf("is_published");
    const slugIdx = headers.indexOf("slug");

    const articles: ParsedArticle[] = [];
    const errorMessages: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const fields = parseCSVLine(lines[i]);
      const title = fields[titleIdx]?.trim();
      const content = fields[contentIdx]?.trim();

      if (!title || !content) {
        errorMessages.push(`Row ${i + 1}: Missing title or content`);
        continue;
      }

      articles.push({
        title,
        slug: slugIdx !== -1 && fields[slugIdx]?.trim() ? fields[slugIdx].trim() : generateSlug(title),
        summary: summaryIdx !== -1 ? fields[summaryIdx]?.trim() || "" : "",
        content,
        source: sourceIdx !== -1 ? fields[sourceIdx]?.trim() || "AfyaConnect" : "AfyaConnect",
        image_url: imageIdx !== -1 ? fields[imageIdx]?.trim() || "" : "",
        is_published: publishedIdx !== -1 ? fields[publishedIdx]?.trim().toLowerCase() === "true" : false,
      });
    }

    if (articles.length === 0) {
      toast({ title: "Error", description: "No valid articles found in CSV.", variant: "destructive" });
      setImporting(false);
      return;
    }

    // Insert in batches of 20
    let imported = 0;
    const batchSize = 20;

    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize).map((a) => ({
        title: a.title,
        slug: a.slug,
        summary: a.summary || null,
        content: a.content,
        source: a.source,
        image_url: a.image_url || null,
        is_published: a.is_published,
        published_at: a.is_published ? new Date().toISOString() : null,
      }));

      const { error } = await supabase.from("health_articles").insert(batch);
      if (error) {
        errorMessages.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        imported += batch.length;
      }
      setProgress(Math.round(((i + batchSize) / articles.length) * 100));
    }

    setResult({ imported, errors: errorMessages.length, errorMessages });
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";

    if (imported > 0) {
      toast({ title: `${imported} articles imported!` });
      onImportComplete();
    }
  };

  return (
    <div className="elevated-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Import Articles from CSV</h3>
        <Button variant="ghost" size="sm" className="text-xs h-7 rounded-lg" onClick={downloadTemplate}>
          <Download className="w-3 h-3 mr-1" /> Template
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Required columns: <strong>title</strong>, <strong>content</strong>. Optional: summary, source, image_url, slug, is_published.
      </p>

      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} disabled={importing} />

      <Button
        variant="outline"
        className="w-full rounded-xl h-10 text-sm"
        onClick={() => fileRef.current?.click()}
        disabled={importing}
      >
        {importing ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Importing…</>
        ) : (
          <><Upload className="w-4 h-4 mr-1.5" /> Choose CSV File</>
        )}
      </Button>

      {importing && <Progress value={progress} className="h-1.5 rounded-full" />}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>{result.imported} articles imported</span>
          </div>
          {result.errors > 0 && (
            <div className="bg-destructive/10 rounded-lg p-2">
              <div className="flex items-center gap-1.5 text-xs text-destructive font-medium mb-1">
                <AlertCircle className="w-3 h-3" /> {result.errors} error(s)
              </div>
              <div className="text-[10px] text-destructive/80 space-y-0.5 max-h-24 overflow-y-auto">
                {result.errorMessages.map((msg, i) => <p key={i}>{msg}</p>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
