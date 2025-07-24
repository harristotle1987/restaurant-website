'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Menu', href: '#menu' },
    { name: 'Specials', href: '#specials' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/90 py-3 shadow-xl' : 'bg-transparent py-5'
    }`}>
      {/* Background overlay for scrolled state */}
      {scrolled && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center relative">
          {/* Logo - Can be replaced with an image */}
          {/* 
            To use an image logo instead of text:
            1. Create folder: public/images/logo
            2. Add logo image: gourmet-house-logo.png
            3. Use this code:
            
            <Link href="/" onClick={() => setIsOpen(false)}>
              <Image 
                src="/images/logo/gourmet-house-logo.png" 
                alt="Gourmet House"
                width={180}
                height={50}
              />
            </Link>
          */}
          
          {/* Logo Text */} 
          <div className="flex items-center space-x-2">
            <Link href="/" onClick={() => setIsOpen(false)}>
             
            </Link>
          </div>
          <div className="flex-shrink-0 z-10">
            <Link 
              href="/" 
              className="text-2xl font-serif font-bold text-amber-400 tracking-wider"
              onClick={() => setIsOpen(false)}
            >
              GOURMET HOUSE
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-grow justify-center">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-amber-50 transition-all hover:text-amber-300 hover:scale-105"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Book Button */}
          <div className="hidden lg:block z-10">
            <Link 
              href="#contact"
              className="bg-amber-600 text-white px-6 py-3 rounded-md font-medium hover:bg-amber-700 transition-all transform hover:-translate-y-0.5 shadow-lg"
            >
              Book a Table
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="lg:hidden z-20">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-amber-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation with Background Image */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-10">
          {/* Blurred Background Image */}
          <div className="absolute inset-0">
            {/* 
              NAVBAR MOBILE BACKGROUND IMAGE 
              - Create folder: public/images/navbar
              - Add image: mobile-menu-bg.jpg
              - Recommended size: 1920x1080 pixels
            */}
              src ={"/images/Res1.jpg"}
            <div 
              className="absolute inset-0 bg-[url('/images/Res1.jpg')] bg-cover bg-center"
              style={{ filter: 'blur(8px)' }}
            />
            <div className="absolute inset-0 bg-black/90" />
          </div>
          
          {/* Menu Content */}
          <div className="relative z-20 pt-20">
            <div className="flex flex-col items-center py-8 space-y-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-xl font-medium text-amber-50 py-2 px-6 rounded-lg hover:bg-amber-900/50 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link 
                href="#contact"
                className="mt-8 bg-amber-600 text-white px-8 py-3 rounded-md text-xl font-medium"
                onClick={() => setIsOpen(false)}
              >
                Book a Table
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}