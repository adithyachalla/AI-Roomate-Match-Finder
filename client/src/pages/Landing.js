import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden mesh-bg bg-background-dark text-slate-100 font-display">
{/* HEADER */}
<header className="flex items-center justify-between px-6 lg:px-20 py-6 bg-background-dark/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">

  {/* LEFT — LOGO */}
  <div className="flex items-center gap-4">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 border-[3px] border-white/20 rounded-md rotate-45 -translate-x-1 -translate-y-1"></div>
      <div className="absolute inset-0 border-[3px] border-accent-teal rounded-md rotate-45 translate-x-1 translate-y-1"></div>
    </div>

    <h2 className="text-white text-2xl font-black tracking-tight">
      Room<span className="text-accent-teal">Sync</span>
    </h2>
  </div>

  {/* RIGHT — NAV */}
  <div className="flex items-center gap-8">
    <Link 
      to="/login" 
      className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
    >
      Log In
    </Link>

   <Link to="/signup" className="flex items-center justify-center rounded-2xl px-12 py-4 bg-primary text-white text-lg font-black shadow-2xl shadow-primary/40 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all">
  Get Started
</Link>
  </div>

</header>

{/* HERO */}
<section className="relative px-6 lg:px-20 pt-24 pb-32 flex flex-col items-center text-center hero-gradient">
  <div className="max-w-4xl mx-auto space-y-10">

    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest">
      <span className="material-symbols-outlined !text-sm">auto_awesome</span>
      Next-Gen Student Matching
    </div>

  <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Find your home,<br/>find your <span className="text-accent-teal">crew</span>.
            </h1>

    <p className="text-slate-400 text-lg lg:text-2xl leading-relaxed max-w-2xl mx-auto font-medium">
      Say goodbye to random selection. RoomSync uses high-precision behavioral modeling to connect students by lifestyle and habits.
    </p>

    {/* CTA Row */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">

  <Link to="/signup" className="px-12 py-5 bg-primary text-white text-xl font-black rounded-2xl shadow-2xl">
    Get Started 
  </Link>


      <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex -space-x-3">
          <img alt="Student" className="size-10 rounded-full border-2 border-background-dark" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD994sTsTtGU7CqNGs21K0DpocFiDwg3YWTbdrHYLtSe8zqnAleAjf4gzdryxSCKoQ8rF9uEIMS63PoYLxL8rFH46J0jyCpD7A8UpPm0ku_jDOrbGxRhTInAMFOK46XpTmtIr8OSgkBcGo2WFq32Zc4-9oGg-2BTE2C0R0EyPYl9x7X3gc23WTLCeyiOwwxATWGykc8O5zJj9Iz1pLtBg0kZFwyz0NhEEQJSkwj5aWV4mmSDAYtroCSNB_Mml4jExzi5Z32Nw_HBH4" />
          <img alt="Student" className="size-10 rounded-full border-2 border-background-dark" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdl-6r47dDiy10dG8EZG3CZE5yxTI5lKirmSYT0tGClfC5v5LEQ4_oAxUY4b5WMwpLwEstYAWci0L-Mn6g10FLz9pkJch6ekDEklvCXnV2G6I02ByhjYEZy8DHPyX5JTQ3hfFmM3Z2Ht24H3LLCIO_j1ujuVMqIqXUeCOxMMt9mgOaUIxI1OOVW6x2jBa4EWBZCNTe4l4hUB1K8y4Hh13TGgXw5bvB4y7OoAUJm0E18pZFJfXulM0S1ouMQM0dXOwf4EnQuH3q3X8" />
          <img alt="Student" className="size-10 rounded-full border-2 border-background-dark" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjIzYpVwZhlb42kbYgNnfEADopRCWP7AVW7Nj826t1V5pG6flJmq0-2ocZ6bx41SBygH9rsPbnneU9Ek51E4daH4ghz2YcxkGlQMlBgZOSXDto3yTJy6KFEEhthnixWlnzKLhRo5XJIiOHbx_W6Gq9vTpqZtqsVIYY1lqo50C55REJxCW29YeMkDoYmthJ3NACgsSc6yUy3ZkuWykiW9YaLE1FMvzVRtpopK2CvysSD9-kNT7WIcBzR6bY8stB81o93e4LFMtOjXQ" />
        </div>

        <div className="flex flex-col items-start">
          <span className="text-sm font-black text-white">50k+ joined</span>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider leading-none">
            Verified Students
          </span>
        </div>
      </div>

    </div>
  </div>
</section>


   {/* AI MATCH SECTION */}
<section className="px-6 lg:px-20 py-32 bg-white/[0.02]">
  <div className="max-w-7xl mx-auto">
    <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">

      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 space-y-10">
        <div className="space-y-4">
          <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            High-Precision <span className="text-primary">AI Compatibility</span> Score
          </h2>
          <p className="text-slate-400 text-xl leading-relaxed font-medium">
            Our algorithm analyzes over 50 data points including sleep cycles, cleanliness, study habits, and social energy.
          </p>
        </div>

        {/* Match Card */}
        <div className="p-8 rounded-[2rem] bg-card-dark border border-white/10 shadow-2xl relative overflow-hidden">
          
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">
                Current Match Rate
              </p>
              <h4 className="text-2xl font-bold text-white">Lifestyle Alignment</h4>
            </div>
            <span className="text-4xl font-black text-accent-teal tracking-tighter">
              98% Match
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
            <div className="h-full bg-gradient-to-r from-primary to-accent-teal rounded-full shadow-[0_0_20px_rgba(45,212,191,0.4)]" style={{ width: "98%" }} />
          </div>

          {/* Metrics */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-primary !text-4xl">schedule</span>
              <span className="text-sm font-black text-white tracking-wide">Time Sync</span>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-primary !text-4xl">cleaning_services</span>
              <span className="text-sm font-black text-white tracking-wide">Cleanliness</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PROFILES */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6 relative">
        <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

        {[
          {
            name: "Sarah Jenkins",
            role: "Psychology Major • Senior",
            percent: "96%",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD994sTsTtGU7CqNGs21K0DpocFiDwg3YWTbdrHYLtSe8zqnAleAjf4gzdryxSCKoQ8rF9uEIMS63PoYLxL8rFH46J0jyCpD7A8UpPm0ku_jDOrbGxRhTInAMFOK46XpTmtIr8OSgkBcGo2WFq32Zc4-9oGg-2BTE2C0R0EyPYl9x7X3gc23WTLCeyiOwwxATWGykc8O5zJj9Iz1pLtBg0kZFwyz0NhEEQJSkwj5aWV4mmSDAYtroCSNB_Mml4jExzi5Z32Nw_HBH4"
          },
          {
            name: "Alex Rivera",
            role: "CS Student • Sophomore",
            percent: "92%",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdl-6r47dDiy10dG8EZG3CZE5yxTI5lKirmSYT0tGClfC5v5LEQ4_oAxUY4b5WMwpLwEstYAWci0L-Mn6g10FLz9pkJch6ekDEklvCXnV2G6I02ByhjYEZy8DHPyX5JTQ3hfFmM3Z2Ht24H3LLCIO_j1ujuVMqIqXUeCOxMMt9mgOaUIxI1OOVW6x2jBa4EWBZCNTe4l4hUB1K8y4Hh13TGgXw5bvB4y7OoAUJm0E18pZFJfXulM0S1ouMQM0dXOwf4EnQuH3q3X8"
          },
          {
            name: "Jordan Lee",
            role: "Business Admin • Junior",
            percent: "89%",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjIzYpVwZhlb42kbYgNnfEADopRCWP7AVW7Nj826t1V5pG6flJmq0-2ocZ6bx41SBygH9rsPbnneU9Ek51E4daH4ghz2YcxkGlQMlBgZOSXDto3yTJy6KFEEhthnixWlnzKLhRo5XJIiOHbx_W6Gq9vTpqZtqsVIYY1lqo50C55REJxCW29YeMkDoYmthJ3NACgsSc6yUy3ZkuWykiW9YaLE1FMvzVRtpopK2CvysSD9-kNT7WIcBzR6bY8stB81o93e4LFMtOjXQ"
          }
        ].map((p, i) => (
          <div
            key={i}
            className={`bg-card-dark p-6 rounded-[2rem] border border-white/10 shadow-2xl flex items-center gap-6 transition-transform duration-500 hover:translate-x-2 ${i === 1 ? "lg:translate-x-12 hover:translate-x-14" : ""}`}
          >
            <div className="relative">
              <img
                src={p.img}
                alt={p.name}
                className="w-28 h-28 rounded-2xl object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute -bottom-2 -right-2 size-8 bg-accent-teal rounded-lg flex items-center justify-center text-background-dark font-black text-xs">
                {p.percent}
              </div>
            </div>

            <div>
              <h3 className="font-black text-xl text-white">{p.name}</h3>
              <p className="text-sm font-bold text-slate-400">{p.role}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  </div>
</section>


      {/* CTA */}
      <section className="px-6 lg:px-20 py-32">
        <div className="max-w-5xl mx-auto bg-gradient-to-b from-card-dark to-background-dark rounded-[3rem] p-12 lg:p-24 text-center border border-white/5">
          <h2 className="text-white text-4xl lg:text-6xl font-black">
            Ready for a better roommate experience?
          </h2>
<Link to="/signup" className="mt-10 inline-block bg-primary text-white text-xl font-black px-14 py-6 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
  Get Started Free
</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 lg:px-20 py-16 border-t border-white/5 bg-background-dark text-center">
        <p className="text-sm text-slate-600 font-medium">© 2026 RoomSync. Built for students.</p>
      </footer>
    </div>
  );
}

export default Landing;
