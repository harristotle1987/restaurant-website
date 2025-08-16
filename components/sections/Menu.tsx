"use client"; 

import React, { useState } from 'react';
import type { MenuItem } from '../../lib/types';
import { motion } from 'framer-motion';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('main');
  
  const categories = [
    { id: 'appetizers', name: 'Appetizers' },
    { id: 'main', name: 'Main Courses' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'drinks', name: 'Drinks' },
  ];

  // Sample menu data - replace with API data
  const menuItems: Record<string, MenuItem[]> = {
    appetizers: [
      { id: 1, name: 'Truffle Arancini', description: 'Risotto balls with black truffle', price: 12.95, popular: true },
      { id: 2, name: 'Seared Scallops', description: 'With cauliflower puree and caviar', price: 16.50 },
      { id: 9, name: 'Beef Carpaccio', description: 'Thinly sliced beef with arugula, capers, truffle oil', price: 14.75 },
      { id: 10, name: 'Crispy Calamari', description: 'Served with spicy aioli and lemon', price: 13.25, popular: true },
    ],
    main: [
      { id: 3, name: 'Filet Mignon', description: '8oz grass-fed beef, truffle mashed potatoes', price: 34.95, popular: true },
      { id: 4, name: 'Wild Salmon', description: 'Pan-seared with lemon dill sauce', price: 26.75 },
      { id: 11, name: 'Duck Confit', description: 'Crispy duck leg with cherry reduction', price: 28.50, popular: true },
      { id: 12, name: 'Mushroom Risotto', description: 'Arborio rice with wild mushrooms and parmesan', price: 22.95 },
    ],
    desserts: [
      { id: 5, name: 'Chocolate Soufflé', description: 'With vanilla ice cream', price: 10.50, popular: true },
      { id: 6, name: 'Crème Brûlée', description: 'Classic vanilla bean', price: 9.25 },
      { id: 13, name: 'Tiramisu', description: 'Traditional Italian coffee dessert', price: 11.00 },
      { id: 14, name: 'Berry Panna Cotta', description: 'With seasonal berry compote', price: 10.75 },
    ],
    drinks: [
      { id: 7, name: 'Signature Cocktail', description: 'House special with seasonal ingredients', price: 14.00 },
      { id: 8, name: 'Wine Flight', description: 'Three 3oz pours of selected wines', price: 18.50 },
      { id: 15, name: 'Craft Negroni', description: 'Premium gin, Campari, sweet vermouth', price: 16.00, popular: true },
      { id: 16, name: 'Espresso Martini', description: 'Vodka, coffee liqueur, fresh espresso', price: 15.50 },
    ]
  };

  return (
    <section id="menu" className="py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-amber-500 rounded-full blur-3xl" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600 rounded-full blur-3xl" aria-hidden="true"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-serif font-bold text-amber-400 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Our Menu
          </motion.h2>
          <motion.div 
            className="w-24 h-1 bg-amber-500 mx-auto mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            aria-hidden="true"
          ></motion.div>
          <motion.p 
            className="text-lg text-amber-100 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Carefully crafted dishes using seasonal ingredients from local suppliers
          </motion.p>
        </div>

        {/* Category Tabs */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-lg'
                  : 'bg-gray-800 text-amber-100 hover:bg-amber-900/50'
              }`}
            >
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Menu Items Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.1 }}
        >
          {menuItems[activeCategory]?.map((item) => (
            <motion.div 
              key={item.id}
              className={`bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border ${
                item.popular 
                  ? 'border-amber-600' 
                  : 'border-gray-700'
              }`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-amber-300">{item.name}</h3>
                    <p className="mt-2 text-amber-100">{item.description}</p>
                  </div>
                  {item.popular && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-900 text-amber-300">
                      Popular
                    </span>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xl font-bold text-amber-400">${item.price.toFixed(2)}</span>
                  <motion.button 
                    className="text-amber-400 hover:text-amber-300 font-medium flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Add to Order
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Menu Highlight */}
        <motion.div 
          className="mt-24 bg-gradient-to-r from-amber-900/70 to-amber-800/70 rounded-3xl p-8 md:p-12 text-white overflow-hidden border border-amber-700/50"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-3xl font-serif font-bold text-amber-300 mb-6">Chef&apos;s Special</h3>
              <p className="text-amber-100 text-lg mb-6 leading-relaxed">
                This week&apos;s exclusive creation features locally sourced ingredients with a modern twist. 
                Ask your server about today&apos;s special preparation.
              </p>
              <div className="flex items-center">
                <div className="bg-amber-600 rounded-full p-2 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-amber-300">Market Fish of the Day</h4>
                  <p className="text-amber-100">Served with seasonal vegetables and herb butter</p>
                </div>
              </div>
            </div>
            <div className="relative h-64 rounded-xl overflow-hidden border-2 border-amber-700/50">
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-[url('/images/menu-special.jpg')] bg-cover bg-center"></div>
              <div className="absolute bottom-0 left-0 p-6 z-20">
                <span className="text-amber-300 font-bold">$32.95</span>
                <h4 className="text-xl font-bold text-white">Today&apos;s Special</h4>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Menu;