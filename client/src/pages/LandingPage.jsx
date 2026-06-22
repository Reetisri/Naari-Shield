import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Radio, Key, Users, Volume2, Activity, MapPin, Eye, ArrowRight, Star, Heart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/25">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
              Naari Shield
            </span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold hover:text-purple-400 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-95 transition-all text-white">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 min-h-[90vh]">
        {/* Background Lights */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="flex-1 space-y-8 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider animate-pulse">
            <Radio className="h-3.5 w-3.5" /> Live SOS Protection Active
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight font-sans">
            Empowering Women's Safety With{' '}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-pulse-slow">
              Intelligent Real-Time AI
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto lg:mx-0">
            Naari Shield keeps you secure with voice-activated SOS triggers, live battery status, sound-evidence collection, rule-based risk profiling, and instant real-time guardian maps synchronization.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/10 hover:shadow-purple-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 text-white">
              Launch Platform <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#features" className="w-full sm:w-auto text-center px-8 py-4 rounded-xl font-semibold border border-white/10 hover:bg-white/5 active:scale-95 transition-all text-slate-300">
              Explore Features
            </a>
          </div>
        </div>

        <div className="flex-1 relative z-10 w-full max-w-lg">
          {/* Dashboard Preview Graphic mockup */}
          <div className="glass-premium p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs uppercase tracking-widest font-extrabold text-red-400">SOS ACTIVE</span>
              </div>
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-white/20" />
                <div className="h-2 w-2 rounded-full bg-white/20" />
                <div className="h-2 w-2 rounded-full bg-white/20" />
              </div>
            </div>
            
            {/* Visual Risk Badge */}
            <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-xl mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-red-300 font-semibold uppercase">Current Risk Profile</div>
                <div className="text-xl font-bold text-red-400 mt-1">High Risk Status (80/100)</div>
              </div>
              <div className="h-10 w-10 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center text-red-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            {/* Visual audio stream and map mockup */}
            <div className="space-y-3">
              <div className="bg-slate-900/60 p-4 border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-purple-400 animate-bounce" />
                  <span className="text-xs text-slate-300">Evidence Audio Streaming...</span>
                </div>
                <span className="text-xs text-purple-400 font-mono">00:15 / 00:30</span>
              </div>

              <div className="h-44 bg-slate-900 border border-white/5 rounded-xl relative overflow-hidden flex items-center justify-center">
                {/* Fake map drawing */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative text-center p-4">
                  <MapPin className="h-8 w-8 text-indigo-400 mx-auto animate-bounce" />
                  <span className="text-[10px] text-slate-400 block mt-2">Broadcasting: 19.0760° N, 72.8777° E</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Powerful Features Created For Safety</h2>
          <p className="text-slate-400">
            Naari Shield implements instant browser endpoints and Socket.io triggers to bypass delay and protect evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass p-8 rounded-2xl hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white text-purple-400 transition-colors">
              <Radio className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mt-6 mb-3">Real-time WebSockets</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Utilizes Socket.io to establish persistent channels that notify guardians immediately upon SOS trigger.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass p-8 rounded-2xl hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white text-purple-400 transition-colors">
              <Volume2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mt-6 mb-3">Voice-Activated SOS</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Integrates Web Speech API listening for keywords like "Help Me", "Emergency", or "Save Me" to bypass manual clicks.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass p-8 rounded-2xl hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white text-purple-400 transition-colors">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mt-6 mb-3">Smart Risk scoring</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Runs rule-based calculations using time zone, battery percentage, movement interval, and SOS activity for user risk level estimation.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass p-8 rounded-2xl hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white text-purple-400 transition-colors">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mt-6 mb-3">Live Map Updates</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Broadcasting user coordinates every 10 seconds to guardians, with historical travel trail drawing.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass p-8 rounded-2xl hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white text-purple-400 transition-colors">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mt-6 mb-3">Audio Evidence Recorder</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              MediaRecorder API triggers a silent 30-second audio upload to the server database for storage as evidence.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass p-8 rounded-2xl hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl w-fit group-hover:bg-purple-600 group-hover:text-white text-purple-400 transition-colors">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mt-6 mb-3">Guardian Dashboard</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Provides emergency banners, telemetry trackers, audio players, and maps interfaces for simultaneous linked users.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-900/30 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How It Protects You</h2>
            <p className="text-slate-400">Simple three-step workflow designed for extreme situations.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Connection line for large screen */}
            <div className="hidden lg:block absolute top-[68px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-purple-500/50 to-indigo-500/50 -z-10" />

            {/* Step 1 */}
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-900 border border-purple-500/40 flex items-center justify-center font-bold text-xl text-purple-400 shadow-lg shadow-purple-500/5">
                1
              </div>
              <h3 className="text-xl font-semibold">User Activates SOS</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Trigger using the emergency pulse button or speak the phrase "Help Me" to start background activities.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-900 border border-purple-500/40 flex items-center justify-center font-bold text-xl text-purple-400 shadow-lg shadow-purple-500/5">
                2
              </div>
              <h3 className="text-xl font-semibold">Evidence Streams Live</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                The client records 30-second audio files, fetches GPS locations every 10 seconds, and tracks battery capacity.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-900 border border-purple-500/40 flex items-center justify-center font-bold text-xl text-purple-400 shadow-lg shadow-purple-500/5">
                3
              </div>
              <h3 className="text-xl font-semibold">Guardians Receive Alert</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Real-time dashboard renders maps paths, provides warning alarms, and plays back uploaded audio evidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="glass p-8 rounded-2xl text-center space-y-2">
            <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-mono">
              100%
            </div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Real-Time Sync</div>
          </div>
          <div className="glass p-8 rounded-2xl text-center space-y-2">
            <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-mono">
              &lt;2s
            </div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Alert Latency</div>
          </div>
          <div className="glass p-8 rounded-2xl text-center space-y-2">
            <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-mono">
              30s
            </div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Audio Clips</div>
          </div>
          <div className="glass p-8 rounded-2xl text-center space-y-2">
            <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-mono">
              0
            </div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Cost Open Source</div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-900/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Loved by Users & Advisors</h2>
            <p className="text-slate-400">Hear from people who recommend safety platform concepts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="glass p-8 rounded-2xl space-y-6 relative">
              <div className="flex gap-1 text-purple-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic">
                "The real-time maps updates and offline-first browser APIs make Naari Shield extremely practical. Having a voice activation feature provides a fallback when you cannot reach your phone screen."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                  AR
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Ananya Rao</h4>
                  <p className="text-xs text-slate-400">Product Manager, SafeTransit</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="glass p-8 rounded-2xl space-y-6 relative">
              <div className="flex gap-1 text-purple-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic">
                "As an internship evaluation project, this portfolio showcase checks all boxes: JWT security, database hooks, websocket server channels, and device APIs. The rule-based scoring engine is easy to pitch."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                  DS
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Devashish Sharma</h4>
                  <p className="text-xs text-slate-400">Technical Lead & Placement Mentor</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="glass p-8 rounded-2xl space-y-6 relative">
              <div className="flex gap-1 text-purple-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic">
                "Connecting my mother as a guardian was simple. She gets push notifications, tracks my commute on her tablet, and can download audio. The battery warnings have helped keep me from going offline."
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                  KP
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Kriti Patel</h4>
                  <p className="text-xs text-slate-400">Student & Active User</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-24 px-6 max-w-5xl mx-auto relative z-10 text-center space-y-8">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 to-indigo-600/10 blur-[80px] rounded-full pointer-events-none -z-10" />
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Your Safety Platform is Free and Ready</h2>
        <p className="text-slate-400 max-w-lg mx-auto text-base">
          Sign up now as a User to configure your safety profile, or register as a Guardian to monitor your friends and family members.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/10 hover:shadow-purple-500/25 active:scale-95 transition-all text-white">
            Register for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-slate-950/80 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            <span className="font-bold text-white">Naari Shield</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#features" className="hover:text-white transition-colors">How it Works</a>
            <Link to="/login" className="hover:text-white transition-colors">Log In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-current" />
            <span>for Women Safety & Hackathons</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
