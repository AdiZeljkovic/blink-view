import ClockWeather from "@/components/ClockWeather";
import SearchBar from "@/components/SearchBar";
import TaskList from "@/components/widgets/TaskList";
import Calendar from "@/components/widgets/Calendar";
import Vaktija from "@/components/widgets/Vaktija";
import QuickNotes from "@/components/widgets/QuickNotes";
import HomelabApps from "@/components/widgets/HomelabApps";
import Bookmarks from "@/components/widgets/Bookmarks";
import NotesList from "@/components/widgets/NotesList";
import MyDayWidget from "@/components/widgets/MyDayWidget";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[1600px] relative z-10">
        <div className="space-y-8">
          {/* Central Block - Clock, Weather and Search */}
          <section className="py-6">
            <ClockWeather />
          </section>

          <section className="max-w-3xl mx-auto">
            <SearchBar />
          </section>

          {/* Main Grid - 3 Column Layout */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-4">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              <Vaktija />
              <Bookmarks />
            </div>

            {/* Center Column */}
            <div className="lg:col-span-2 space-y-6">
              <MyDayWidget />
              <HomelabApps />
              <QuickNotes />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
              <TaskList />
              <Calendar />
              <NotesList />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
