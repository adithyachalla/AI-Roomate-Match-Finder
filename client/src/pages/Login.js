import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">

     {/* LEFT SIDE DESIGN PANEL */}
<div className="hidden lg:flex relative bg-navy-deep overflow-hidden items-center justify-center p-12">

  {/* glow blobs */}
  <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
  <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-teal/20 rounded-full blur-[120px]" />

  <div className="relative z-10 max-w-lg text-white">

    {/* 🔷 LOGO */}
    <div className="flex items-center gap-6 mb-10">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-[5px] border-white/20 rounded-lg rotate-45 -translate-x-2 -translate-y-2"></div>
        <div className="absolute inset-0 border-[5px] border-accent-teal rounded-lg rotate-45 translate-x-2 translate-y-2"></div>
      </div>

      <div className="text-5xl font-light tracking-tighter">
        Room<span className="font-extrabold text-accent-teal">Sync</span>
      </div>
    </div>

    {/* TEXT */}
    <h2 className="text-4xl font-extrabold leading-tight mb-6">
      Find your perfect match, not just a roommate.
    </h2>

    <p className="text-white/70 text-lg">
      Join thousands of students using AI to discover compatible living partners.
    </p>

  </div>
</div>


      {/* RIGHT SIDE FORM */}
      <main className="flex flex-col items-center justify-center p-6 md:p-12 lg:p-24">
        <div className="w-full max-w-md space-y-8">

          <div>
            <h1 className="text-3xl font-extrabold mb-2">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400">Sign in to continue</p>
          </div>

          <form className="space-y-6">
            <input
              type="email"
              placeholder="University Email"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 focus:ring-primary focus:border-primary"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-4 focus:ring-primary focus:border-primary"
            />

            <button className="w-full py-4 bg-primary text-white font-extrabold rounded-xl shadow-lg hover:scale-105 transition-all">
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
