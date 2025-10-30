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

export interface ProposalItem {
  id: string;
  opisUsluge: string;
  kolicina: number;
  cijena: number;
}

export interface Proposal {
  id: string;
  clientId: string;
  dealId?: string;
  naziv: string;
  stavke: ProposalItem[];
  ukupanIznos: number;
  status: "nacrt" | "poslano" | "prihvaceno" | "odbijeno";
  datumKreiranja: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  naziv: string;
  opis: string;
  rok?: string;
  completed: boolean;
}

export interface Project {
  id: string;
  clientId: string;
  dealId?: string;
  naziv: string;
  status: "planirano" | "u_toku" | "na_cekanju" | "zavrseno";
  budzet: number;
  rok?: string;
  datumPocetka: string;
  utrosenSati?: number;
  zadaci: ProjectTask[];
}

export interface Subscription {
  id: string;
  clientId: string;
  nazivUsluge: string;
  mjesecniIznos: number;
  datumPocetka: string;
  danNaplate: number;
  aktivna: boolean;
}

export interface VaultEntry {
  id: string;
  clientId: string;
  tip: "login" | "boja" | "link" | "licenca";
  naziv: string;
  vrijednost: string;
  dodatneInformacije?: string;
}

export interface SupportTicket {
  id: string;
  clientId: string;
  opisProblema: string;
  prioritet: "nizak" | "srednji" | "visok";
  status: "otvoren" | "u_radu" | "riješen";
  datumKreiranja: string;
  datumRješavanja?: string;
}
