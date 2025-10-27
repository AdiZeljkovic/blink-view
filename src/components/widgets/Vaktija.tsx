import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VaktijaData {
  datum: string;
  lokacija: string;
  vakat: {
    zora: string;
    izlazak_sunca: string;
    podne: string;
    ikindija: string;
    aksam: string;
    jacija: string;
  };
}

const Vaktija = () => {
  const [vaktija, setVaktija] = useState<VaktijaData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVaktija = async () => {
      try {
        const response = await fetch("https://api.vaktija.ba/v1");
        if (!response.ok) throw new Error("Failed to fetch vaktija");
        const data = await response.json();
        setVaktija(data);
      } catch (error) {
        console.error("Error fetching vaktija:", error);
        toast({
          title: "Greška",
          description: "Nije moguće učitati vaktiju",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVaktija();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!vaktija) return null;

  const vaktovi = [
    { naziv: "Zora", vrijeme: vaktija.vakat.zora },
    { naziv: "Izlazak Sunca", vrijeme: vaktija.vakat.izlazak_sunca },
    { naziv: "Podne", vrijeme: vaktija.vakat.podne },
    { naziv: "Ikindija", vrijeme: vaktija.vakat.ikindija },
    { naziv: "Akšam", vrijeme: vaktija.vakat.aksam },
    { naziv: "Jacija", vrijeme: vaktija.vakat.jacija },
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Vaktija</CardTitle>
        <p className="text-sm text-muted-foreground">
          {vaktija.datum} - {vaktija.lokacija}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {vaktovi.map((vakt) => (
            <div
              key={vakt.naziv}
              className="flex justify-between items-center py-2 border-b border-border last:border-0"
            >
              <span className="text-sm font-medium">{vakt.naziv}</span>
              <span className="text-sm font-bold text-primary">{vakt.vrijeme}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Vaktija;
