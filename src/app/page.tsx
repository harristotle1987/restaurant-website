import Image from 'next/image';
import About from '../../components/sections/About';
import Menu from '../../components/sections/Menu';
import Specials from '../../components/sections/Specials';
import Gallery from '../../components/sections/Gallery';
import Contact from '../../components/sections/Contact';
import Navbar from '../../components/layout/Navbar';

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gourmet House | Fine Dining',
  description: 'Premium restaurant experience since 2010',
};

export default function Home() {
  return (
    <>
      {/* Enhanced Hero Section */}
      <section className="relative h-screen">
        {/* Background with image and video support */}
        <div className="absolute inset-0 z-0">
          {/* Video Background */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover hidden md:block"
          >
            <source src="/videos/Res.mp4" type="video/mp4" />
          </video>
          
          {/* Fallback Image */}
          <Image 
            src="/images/hero-bg.jpg" 
            alt="Restaurant ambiance"
            className="w-full h-full object-cover md:hidden"
            width={1920}
            height={1080}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
        </div>

        {/* Navbar */}
        <Navbar />
        
        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in">
              Welcome to <span className="text-amber-400">Gourmet House</span>
            </h1>
            
            <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6" />
            
            <p className="text-xl md:text-2xl text-white mb-10 max-w-2xl mx-auto animate-fade-in delay-200">
              Delivering great food for more than 18 years!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-500">
              <a 
                href="#menu"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-amber-700 px-8 py-3 rounded-md text-lg font-medium transition-all duration-300"
              >
                Our Menu
              </a>
              <a 
                href="#contact"
                className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white px-8 py-3 rounded-md text-lg font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
              >
                Book a Table
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Sections */}
      <About />
      <Menu />
      <Specials />
      <Gallery />
      <Contact />
    
    </>
  );
}