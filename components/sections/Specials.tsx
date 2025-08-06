"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Form validation schema
const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type SubscribeFormData = z.infer<typeof subscribeSchema>;

const Specials = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeSchema)
  });

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (submitSuccess) {
      timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [submitSuccess]);

  const onSubmit = async (data: SubscribeFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: data.email
        })
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error(`Server returned ${response.status}: ${textResponse.substring(0, 100)}`);
      }

      const responseData = await response.json();

      if (!response.ok) {
        const error: any = new Error(responseData.error || `Server error: ${response.status}`);
        error.statusCode = response.status;
        throw error;
      }

      setSubmitSuccess(true);
      reset();
    } catch (error: any) {
      console.error('Subscription error:', error);
      
      // User-friendly error messages
      let userMessage = 'Failed to subscribe. Please try again.';
      
      if (error.message.includes('ECONNREFUSED') || 
          error.message.includes('connection refused')) {
        userMessage = 'Our subscription service is currently unavailable. Please try again later.';
      } else if (error.message.includes('authentication failed')) {
        userMessage = 'Service configuration issue. We\'re working on it!';
      } else if (error.statusCode === 409) {
        userMessage = 'This email is already subscribed.';
      }
      
      setSubmitError(userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const specials = [
    {
      id: 1,
      title: "Weekend Brunch",
      description: "Enjoy our signature brunch menu every Saturday & Sunday 10am-2pm",
      discount: "15% OFF",
      image: "/images/specials/brunch.jpg", 
      validUntil: "2023-12-31"
    },
    {
      id: 2,
      title: "Date Night Package",
      description: "3-course meal for two with wine pairing",
      discount: "$99",
      image: "/images/specials/date-night.jpg",
      validUntil: "2023-11-30"
    },
    {
      id: 3,
      title: "Happy Hour",
      description: "Half-price appetizers and $5 cocktails Mon-Fri 4-6pm",
      discount: "50% OFF",
      image: "/images/specials/happy-hour.jpg", 
      validUntil: "Ongoing"
    }
  ];

  return (
    <section id="specials" className="py-20 bg-gradient-to-r from-amber-800 to-amber-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Weekly Specials</h2>
          <p className="text-amber-200 max-w-3xl mx-auto">
            Exclusive offers and seasonal promotions curated by our chef
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specials.map((special) => (
            <motion.div 
              key={special.id}
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-amber-600"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={special.image}
                  alt={special.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full font-bold">
                  {special.discount}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{special.title}</h3>
                <p className="text-amber-100 mb-4">{special.description}</p>
                
                <div className="flex justify-between items-center mt-6">
                  <span className="text-amber-300 text-sm">
                    Valid until: {special.validUntil}
                  </span>
                  <button className="bg-white text-amber-800 px-4 py-2 rounded-md font-medium hover:bg-amber-100 transition-colors">
                    Reserve Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-amber-200 mb-4">Sign up for exclusive offers</p>
          
          {submitSuccess ? (
            <motion.div 
              className="max-w-md mx-auto bg-green-800/30 text-green-100 p-4 rounded-md border border-green-700/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <p>Thank you for subscribing! Check your email for confirmation.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
              {submitError && (
                <div className="mb-4 bg-red-900/40 text-red-100 p-3 rounded-md border border-red-700/50">
                  <p>{submitError}</p>
                </div>
              )}
              
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className={`flex-grow px-4 py-3 rounded-l-md text-gray-900 focus:outline-none ${
                    errors.email ? 'border-2 border-red-500' : ''
                  }`}
                  {...register('email')}
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-500 text-white px-6 py-3 rounded-r-md font-medium hover:bg-amber-600 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subscribing...
                    </span>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>
              {errors.email && (
                <p className="mt-1 text-red-300 text-sm text-left">{errors.email.message}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Specials;