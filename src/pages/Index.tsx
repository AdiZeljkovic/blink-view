import Clock from "@/components/Clock";
import SearchBar from "@/components/SearchBar";
import TaskList from "@/components/widgets/TaskList";
import Calendar from "@/components/widgets/Calendar";
import Weather from "@/components/widgets/Weather";
import QuickNotes from "@/components/widgets/QuickNotes";
import HomelabApps from "@/components/widgets/HomelabApps";
import Bookmarks from "@/components/widgets/Bookmarks";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[1600px]">
        <div className="space-y-8">
          {/* Central Block - Clock and Search */}
          <section className="py-6">
            <Clock />
          </section>

          <section className="max-w-3xl mx-auto">
            <SearchBar />
          </section>

          {/* Main Grid - 3 Column Layout */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-4">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              <Weather />
              <Bookmarks />
            </div>

            {/* Center Column */}
            <div className="lg:col-span-2 space-y-6">
              <HomelabApps />
              <QuickNotes />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
              <TaskList />
              <Calendar />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
