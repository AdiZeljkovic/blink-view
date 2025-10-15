import { useState } from "react";
import TabNavigation from "@/components/TabNavigation";
import Clock from "@/components/Clock";
import SearchBar from "@/components/SearchBar";
import TaskList from "@/components/widgets/TaskList";
import Calendar from "@/components/widgets/Calendar";
import Weather from "@/components/widgets/Weather";
import QuickNotes from "@/components/widgets/QuickNotes";

const Index = () => {
  const [activeTab, setActiveTab] = useState("fokus");

  return (
    <div className="min-h-screen flex flex-col">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === "fokus" && (
        <main className="flex-1 container mx-auto px-8 py-16">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* Header with Clock */}
            <section className="py-12">
              <Clock />
            </section>

            {/* Search Bar */}
            <section>
              <SearchBar />
            </section>

            {/* Widgets Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-8">
              {/* Left Column */}
              <div className="space-y-16">
                <TaskList />
                <Calendar />
              </div>

              {/* Right Column */}
              <div className="space-y-16">
                <Weather />
                <QuickNotes />
              </div>
            </section>
          </div>
        </main>
      )}

      {activeTab !== "fokus" && (
        <main className="flex-1 container mx-auto px-8 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="font-mono-heading text-3xl mb-4">
              {activeTab === "homelab" && "HOMELAB"}
              {activeTab === "sadrzaj" && "SADRŽAJ"}
              {activeTab === "projekti" && "PROJEKTI"}
            </h2>
            <p className="text-muted-foreground">
              Ova sekcija je u pripremi
            </p>
          </div>
        </main>
      )}
    </div>
  );
};

export default Index;
