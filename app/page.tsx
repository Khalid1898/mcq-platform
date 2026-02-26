export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">MCQ Platform</h1>
      <p className="text-gray-600 mb-6">
        Practice smart. Track progress. Improve faster.
      </p>
      <a
        href="/quizzes"
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
      >
        Browse Quizzes
      </a>
    </main>
  );
}
