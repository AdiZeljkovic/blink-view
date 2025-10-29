export interface Client {
  id: string;
  ime: string;
  kompanija: string;
  email: string;
  telefon: string;
  adresa: string;
  biljeske: string;
  datumZadnjegKontakta?: string;
}

export interface Deal {
  id: string;
  clientId: string;
  naziv: string;
  vrijednost: number;
  status: "novi" | "pregovori" | "ponuda" | "dobijeno" | "izgubljeno";
}

export interface Invoice {
  id: string;
  clientId: string;
  brojFakture: string;
  iznos: number;
  datumIzdavanja: string;
  rokPlacanja: string;
  status: "nacrt" | "poslano" | "placeno" | "kasni";
}

export interface Task {
  id: string;
  clientId: string;
  naziv: string;
  rok: string;
  completed: boolean;
}

export interface CommunicationEntry {
  id: string;
  clientId: string;
  datum: string;
  tip: "email" | "poziv" | "sastanak";
  sazetak: string;
}
