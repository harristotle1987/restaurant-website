"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';

const About = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const stats = [
    { value: "13+", label: "Years of Excellence" },
    { value: "50+", label: "Signature Dishes" },
    { value: "100%", label: "Locally Sourced" },
    { value: "5k+", label: "Happy Customers" },
  ];

  const teamMembers = [
    { 
      name: "Chef Marco Rossi", 
      role: "Executive Chef", 
      bio: "Michelin-star trained with 20 years of culinary experience",
      photo: "/images/team/chef2.jpg" 
    },
    { 
      name: "Sophia Chen", 
      role: "Pastry Chef", 
      bio: "Specialized in French patisserie and modern desserts",
      photo: "/images/team/chef3.jpg" 
    },
    { 
      name: "James Wilson", 
      role: "Sommelier", 
      bio: "Wine expert with certifications from 5 countries",
      photo: "/images/team/chef1.webp" 
    },
  ];

  const galleryImages = Array.from({ length: 8 }, (_, i) => 
    `/images/gallery/${i + 1}.jpg`
  );

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" aria-hidden="true"></div>
        <div className="absolute bottom-40 left-0 w-80 h-80 bg-amber-600 rounded-full blur-3xl" aria-hidden="true"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-amber-400 mb-4">
            Our Culinary Journey
          </h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto mb-6" aria-hidden="true"></div>
          <p className="text-lg text-amber-100 max-w-3xl mx-auto">
            Where passion meets perfection on every plate
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants}>
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-amber-900/50">
              <div className="aspect-video bg-black">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/jNYpHClTmZE" 
                  title="Modern restaurant interior design (11.ai)" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-800 rounded-xl shadow-lg border-4 border-amber-700 overflow-hidden">
                <div className="bg-gradient-to-br from-amber-500 to-amber-700 w-full h-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm text-center">Since 2010</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-amber-50">
            <h3 className="text-2xl font-serif font-bold text-amber-300 mb-4">Our Story</h3>
            <p className="text-amber-100 mb-6 text-lg leading-relaxed">
              Founded in 2010 by culinary visionary Elena Martinez, Restaurantly began as a small bistro with a big dream: 
              to revolutionize fine dining through locally sourced ingredients and innovative techniques.
            </p>
            <p className="text-amber-100 mb-8 text-lg leading-relaxed">
              What started as a 12-seat establishment has blossomed into an award-winning destination, recognized for our 
              commitment to sustainability and unforgettable dining experiences. Our journey continues as we explore new 
              culinary frontiers while honoring traditional flavors.
            </p>
            
            <div className="flex items-center">
              <div className="mr-4">
                <div className="w-16 h-16 rounded-full bg-amber-900 border-4 border-amber-700 flex items-center justify-center">
                  <span className="text-amber-300 font-bold" aria-label="Elena Martinez initials">EM</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-amber-300">Elena Martinez</h4>
                <p className="text-amber-400">Founder & Culinary Director</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              className="bg-gray-800 p-6 rounded-xl shadow-lg text-center border border-amber-800/50 hover:shadow-xl transition-all"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-3xl font-bold text-amber-400 mb-2">{stat.value}</div>
              <div className="text-amber-100">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Gallery Section */}
        <motion.div 
          className="mb-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl font-serif font-bold text-center text-amber-300 mb-8">Behind the Scenes</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((src, index) => (
              <motion.div 
                key={index}
                className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative w-full h-full">
                  <Image 
                    src={src}
                    alt={`Restaurant gallery ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-opacity duration-300 hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-sm font-medium">Gallery #{index + 1}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <motion.h3 
            className="text-3xl font-serif font-bold text-amber-300 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Meet Our Culinary Artists
          </motion.h3>
          <motion.div 
            className="w-24 h-1 bg-amber-500 mx-auto mb-12"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            aria-hidden="true"
          ></motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {teamMembers.map((member, index) => (
            <motion.div 
              key={index}
              className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-amber-800/30"
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-amber-700 shadow-lg">
                    <Image 
                      src={member.photo}
                      alt={`${member.name}, ${member.role}`}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-center text-amber-300 mb-1">{member.name}</h4>
                <p className="text-amber-500 text-center mb-4">{member.role}</p>
                <p className="text-amber-100 text-center">{member.bio}</p>
              </div>
              <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 px-6 py-3 border-t border-amber-800/30">
                <div className="flex justify-center space-x-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-amber-800/70 flex items-center justify-center text-amber-300 hover:bg-amber-700 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Philosophy Section */}
        <motion.div 
          className="mt-24 bg-gradient-to-r from-amber-800 to-amber-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden border border-amber-700/50"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-700/30 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h3 className="text-3xl font-serif font-bold mb-6">Our Culinary Philosophy</h3>
            <p className="text-xl text-amber-100 leading-relaxed mb-8 italic">
              "              &ldquo;              &ldquo;We believe that extraordinary dining experiences come from the perfect harmony of fresh ingredients, 
              skilled craftsmanship, and heartfelt hospitality. Each dish tells a story of passion, tradition, 
              and innovation.&rdquo;&rdquo;"
            </p>
            <div className="flex justify-center">
              <a 
                href="/documents/restaurantly-menu.pdf" 
                download="Restaurantly_Menu.pdf"
                className="bg-amber-600 text-white px-8 py-3 rounded-full font-medium inline-flex items-center hover:bg-amber-700 transition-all transform hover:-translate-y-0.5 shadow-lg"
              >
                Download Full Menu (PDF)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;