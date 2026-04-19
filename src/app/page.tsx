import Navbar from '@/components/home/Navbar'
import HeroSection from '@/components/home/HeroSection'
import StatsSection from '@/components/home/StatsSection'
import Features from '@/components/home/Features'
import StoriesLeaderboard from '@/components/home/StoriesLeaderboard'
import XPChart from '@/components/home/XPChart'
import Testimonials from '@/components/home/Testimonials'
import Footer from '@/components/home/Footer'

export default function HomePage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(160deg, #0B0F19 0%, #0f1628 40%, #1A0B2E 100%)' }}
    >
      {/* Fixed animated orbs — always in bg */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-700/8 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-purple-800/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-700/6 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '6s' }} />
      </div>

      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <StatsSection />
        <Features />
        <StoriesLeaderboard />
        <XPChart />
        <Testimonials />
        <Footer />
      </div>
    </div>
  )
}
