import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface Transaction {
  id: string;
  opis: string;
  iznos: number;
  tip: "prihod" | "rashod";
  datum: string;
}

const Finance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [opis, setOpis] = useState("");
  const [iznos, setIznos] = useState("");
  const [tip, setTip] = useState<"prihod" | "rashod">("prihod");
  const [datum, setDatum] = useState(new Date().toISOString().split("T")[0]);
  const { toast } = useToast();

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const saved = await storage.getJSON<Transaction[]>("finance-transactions");
        if (saved) setTransactions(saved);
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    };
    loadTransactions();
  }, []);

  const saveTransactions = async (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    try {
      await storage.setJSON("finance-transactions", newTransactions);
    } catch (error) {
      console.error("Error saving transactions:", error);
      toast({
        title: "Greška",
        description: "Nije moguće sačuvati transakciju",
        variant: "destructive",
      });
    }
  };

  const addTransaction = async () => {
    if (!opis || !iznos) {
      toast({
        title: "Upozorenje",
        description: "Popunite sva polja",
        variant: "destructive",
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      opis,
      iznos: parseFloat(iznos),
      tip,
      datum,
    };

    await saveTransactions([newTransaction, ...transactions]);
    setOpis("");
    setIznos("");
    setDatum(new Date().toISOString().split("T")[0]);
    toast({
      title: "Uspjeh",
      description: "Transakcija je dodana",
    });
  };

  const deleteTransaction = async (id: string) => {
    await saveTransactions(transactions.filter((t) => t.id !== id));
    toast({
      title: "Uspjeh",
      description: "Transakcija je obrisana",
    });
  };

  const totalPrihod = transactions
    .filter((t) => t.tip === "prihod")
    .reduce((sum, t) => sum + t.iznos, 0);
  const totalRashod = transactions
    .filter((t) => t.tip === "rashod")
    .reduce((sum, t) => sum + t.iznos, 0);
  const balans = totalPrihod - totalRashod;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[1400px]">
        <h1 className="text-4xl font-bold mb-8">Kućne Finansije</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupni Prihodi</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalPrihod.toFixed(2)} KM</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ukupni Rashodi</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalRashod.toFixed(2)} KM</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balans</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balans >= 0 ? "text-green-600" : "text-red-600"}`}>
                {balans.toFixed(2)} KM
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dodaj Novu Transakciju</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="opis">Opis</Label>
                <Input
                  id="opis"
                  value={opis}
                  onChange={(e) => setOpis(e.target.value)}
                  placeholder="Plata, Račun za struju..."
                />
              </div>
              <div>
                <Label htmlFor="iznos">Iznos (KM)</Label>
                <Input
                  id="iznos"
                  type="number"
                  value={iznos}
                  onChange={(e) => setIznos(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="tip">Tip</Label>
                <Select value={tip} onValueChange={(v) => setTip(v as "prihod" | "rashod")}>
                  <SelectTrigger id="tip">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prihod">Prihod</SelectItem>
                    <SelectItem value="rashod">Rashod</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="datum">Datum</Label>
                <Input
                  id="datum"
                  type="date"
                  value={datum}
                  onChange={(e) => setDatum(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addTransaction} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transakcije</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Opis</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead className="text-right">Iznos</TableHead>
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nema transakcija
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.datum}</TableCell>
                      <TableCell>{t.opis}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            t.tip === "prihod"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {t.tip === "prihod" ? "Prihod" : "Rashod"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">{t.iznos.toFixed(2)} KM</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteTransaction(t.id)}
                        >
                          Obriši
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Finance;
