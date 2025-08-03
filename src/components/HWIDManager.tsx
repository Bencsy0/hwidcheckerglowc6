import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Search, Copy, Monitor } from "lucide-react";

interface HWIDEntry {
  id: string;
  hwid: string;
  playerName: string;
  dateAdded: string;
  lastSeen: string;
}

const HWIDManager = () => {
  const [hwidList, setHwidList] = useState<HWIDEntry[]>([]);
  const [newHWID, setNewHWID] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("minecraft-hwid-list");
    if (saved) {
      setHwidList(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever hwidList changes
  useEffect(() => {
    localStorage.setItem("minecraft-hwid-list", JSON.stringify(hwidList));
  }, [hwidList]);

  const addHWID = () => {
    if (!newHWID.trim()) {
      toast({
        title: "Błąd",
        description: "HWID nie może być pusty",
        variant: "destructive",
      });
      return;
    }

    // Check if HWID already exists
    if (hwidList.some(entry => entry.hwid === newHWID.trim())) {
      toast({
        title: "Błąd",
        description: "Ten HWID już istnieje w bazie",
        variant: "destructive",
      });
      return;
    }

    const newEntry: HWIDEntry = {
      id: Date.now().toString(),
      hwid: newHWID.trim(),
      playerName: newPlayerName.trim() || "Nieznany",
      dateAdded: new Date().toLocaleString("pl-PL"),
      lastSeen: new Date().toLocaleString("pl-PL"),
    };

    setHwidList(prev => [newEntry, ...prev]);
    setNewHWID("");
    setNewPlayerName("");
    
    toast({
      title: "Sukces",
      description: "HWID został dodany do bazy",
    });
  };

  const removeHWID = (id: string) => {
    setHwidList(prev => prev.filter(entry => entry.id !== id));
    toast({
      title: "Usunięto",
      description: "HWID został usunięty z bazy",
    });
  };

  const copyHWID = (hwid: string) => {
    navigator.clipboard.writeText(hwid);
    toast({
      title: "Skopiowano",
      description: "HWID został skopiowany do schowka",
    });
  };

  const filteredHWIDList = hwidList.filter(entry =>
    entry.hwid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.playerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Monitor className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-minecraft-green bg-clip-text text-transparent">
              Minecraft HWID Manager
            </h1>
          </div>
          <p className="text-muted-foreground">
            Zarządzaj identyfikatorami sprzętu zbieranymi przez mod Minecraft
          </p>
        </div>

        {/* Add HWID Form */}
        <Card className="p-6 bg-gradient-to-br from-card to-minecraft-dark border-primary/20">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Dodaj nowy HWID</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="hwid">HWID</Label>
              <Input
                id="hwid"
                placeholder="Wpisz HWID..."
                value={newHWID}
                onChange={(e) => setNewHWID(e.target.value)}
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="playerName">Nazwa gracza (opcjonalne)</Label>
              <Input
                id="playerName"
                placeholder="Nazwa gracza..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={addHWID} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                Dodaj HWID
              </Button>
            </div>
          </div>
        </Card>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Szukaj HWID lub nazwy gracza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary" className="text-sm">
            Łącznie HWID: {hwidList.length}
          </Badge>
        </div>

        {/* HWID Table */}
        <Card className="bg-gradient-to-br from-card to-minecraft-dark border-primary/20">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>HWID</TableHead>
                  <TableHead>Nazwa gracza</TableHead>
                  <TableHead>Data dodania</TableHead>
                  <TableHead>Ostatnio widziany</TableHead>
                  <TableHead className="text-center">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHWIDList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {hwidList.length === 0 ? "Brak HWID w bazie" : "Brak wyników wyszukiwania"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHWIDList.map((entry) => (
                    <TableRow key={entry.id} className="border-border">
                      <TableCell className="font-mono text-sm max-w-xs">
                        <div className="truncate" title={entry.hwid}>
                          {entry.hwid}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.playerName}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.dateAdded}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.lastSeen}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyHWID(entry.hwid)}
                            className="h-8 w-8 p-0 hover:bg-primary/20"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHWID(entry.id)}
                            className="h-8 w-8 p-0 hover:bg-destructive/20 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Dane są przechowywane lokalnie w przeglądarce</p>
        </div>
      </div>
    </div>
  );
};

export default HWIDManager;