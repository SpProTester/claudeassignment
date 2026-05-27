import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Your Dream Job — Job Portal",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Find Your <span className="text-brand-600">Dream Job</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Connect with top employers and discover thousands of opportunities that match your skills and aspirations.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/jobs"
            className="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Browse Jobs
          </a>
          <a href="/auth/register" className="text-sm font-semibold leading-6 text-foreground hover:text-brand-600">
            Post a Job <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </main>
  );
}
