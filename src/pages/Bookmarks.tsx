import BookmarksWidget from "@/components/widgets/Bookmarks";

const Bookmarks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-6 py-8 max-w-[1000px]">
        <h1 className="text-4xl font-bold mb-8">Bookmarks</h1>
        <BookmarksWidget />
      </main>
    </div>
  );
};

export default Bookmarks;
