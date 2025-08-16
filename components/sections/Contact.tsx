"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FiCalendar, FiClock, FiUser, FiPhone, FiMail, FiMessageSquare, FiCheck } from 'react-icons/fi';

// Form validation schema
const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  date: z.string().nonempty("Please select a date"),
  time: z.string().nonempty("Please select a time"),
  guests: z.number().min(1, "At least 1 guest required").max(20, "Maximum 20 guests"),
  message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function Contact() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema)
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    const [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Convert time to 24-hour format for backend
      const time24h = convertTo24Hour(data.time);
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          date: data.date, // Send date as YYYY-MM-DD string
          time: time24h    // Send time in 24-hour format
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
        throw new Error(responseData.error || `Server error: ${response.status}`);
      }

      setSubmitSuccess(true);
      reset();
    } catch (error) {
      console.error('Booking error:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Failed to submit booking. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available time slots
  const timeSlots = [
    '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', 
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600 rounded-full blur-3xl" aria-hidden="true"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-amber-400 mb-4">Reserve Your Table</h2>
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
            Experience our culinary excellence - book your table today
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="bg-gradient-to-br from-amber-900/50 to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-amber-800/50"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-r from-amber-800 to-amber-900 p-8 text-white">
              <h3 className="text-2xl font-serif font-bold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiPhone className="text-amber-300 mt-1 mr-3" size={20} />
                  <div>
                    <h4 className="font-medium text-amber-100">Phone</h4>
                    <p className="text-amber-300">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiMail className="text-amber-300 mt-1 mr-3" size={20} />
                  <div>
                    <h4 className="font-medium text-amber-100">Email</h4>
                    <p className="text-amber-300">reservations@restaurantly.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiClock className="text-amber-300 mt-1 mr-3" size={20} />
                  <div>
                    <h4 className="font-medium text-amber-100">Opening Hours</h4>
                    <p className="text-amber-300">Monday - Sunday: 11:00 AM - 10:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <h3 className="text-xl font-serif font-bold text-amber-300 mb-4">Private Events</h3>
              <p className="text-amber-100 mb-6">
                Host your special occasions in our elegant private dining rooms. 
                Perfect for weddings, corporate events, and celebrations.
              </p>
              <button className="w-full bg-amber-800/50 hover:bg-amber-700/70 text-amber-100 font-medium py-3 px-6 rounded-lg transition-colors border border-amber-700/50">
                Inquire About Events
              </button>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-amber-900/20 to-gray-900 rounded-2xl shadow-xl p-8 border border-amber-800/50"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {submitSuccess ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 mb-6">
                  <FiCheck className="h-10 w-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-amber-300 mb-2">Reservation Confirmed!</h3>
                <p className="text-amber-100 mb-6">
                  Thank you for your booking. We've sent a confirmation to your email.
                </p>
                <motion.button 
                  onClick={() => setSubmitSuccess(false)}
                  className="bg-gradient-to-r from-amber-700 to-amber-800 text-white font-medium py-2 px-6 rounded-lg hover:opacity-90 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Make Another Reservation
                </motion.button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                {submitError && (
                  <div className="mb-6 p-4 bg-red-900/40 text-red-100 rounded-lg border border-red-700/50">
                    <p className="text-center font-medium">{submitError}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="relative">
                    <label className="block text-amber-100 mb-2 font-medium">Full Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                      <input
                        {...register('name')}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800 border ${
                          errors.name ? 'border-red-500' : 'border-amber-800/50'
                        } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-100 placeholder-amber-700`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-red-400 text-sm">{errors.name.message}</p>
                    )}
                  </div>
                  
                  {/* Email Field */}
                  <div className="relative">
                    <label className="block text-amber-100 mb-2 font-medium">Email</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                      <input
                        type="email"
                        {...register('email')}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800 border ${
                          errors.email ? 'border-red-500' : 'border-amber-800/50'
                        } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-100 placeholder-amber-700`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-red-400 text-sm">{errors.email.message}</p>
                    )}
                  </div>
                  
                  {/* Phone Field */}
                  <div className="relative">
                    <label className="block text-amber-100 mb-2 font-medium">Phone</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                      <input
                        {...register('phone')}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800 border ${
                          errors.phone ? 'border-red-500' : 'border-amber-800/50'
                        } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-100 placeholder-amber-700`}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-red-400 text-sm">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  {/* Guests Field */}
                  <div className="relative">
                    <label className="block text-amber-100 mb-2 font-medium">Number of Guests</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                      <select
                        {...register('guests', { valueAsNumber: true })}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800 border ${
                          errors.guests ? 'border-red-500' : 'border-amber-800/50'
                        } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-100 appearance-none`}
                      >
                        <option value="" className="text-amber-700">Select guests</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(num => (
                          <option key={num} value={num} className="text-amber-100">{num} {num === 1 ? 'person' : 'people'}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-amber-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                    {errors.guests && (
                      <p className="mt-1 text-red-400 text-sm">{errors.guests.message}</p>
                    )}
                  </div>
                  
                  {/* Date Field */}
                  <div className="relative">
                    <label className="block text-amber-100 mb-2 font-medium">Date</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                      <input
                        type="date"
                        {...register('date')}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800 border ${
                          errors.date ? 'border-red-500' : 'border-amber-800/50'
                        } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-100`}
                      />
                    </div>
                    {errors.date && (
                      <p className="mt-1 text-red-400 text-sm">{errors.date.message}</p>
                    )}
                  </div>
                  
                  {/* Time Field */}
                  <div className="relative">
                    <label className="block text-amber-100 mb-2 font-medium">Time</label>
                    <div className="relative">
                      <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
                      <select
                        {...register('time')}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800 border ${
                          errors.time ? 'border-red-500' : 'border-amber-800/50'
                        } rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-100 appearance-none`}
                      >
                        <option value="" className="text-amber-700">Select time</option>
                        {timeSlots.map(time => (
                          <option key={time} value={time} className="text-amber-100">{time}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-amber-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                    {errors.time && (
                      <p className="mt-1 text-red-400 text-sm">{errors.time.message}</p>
                    )}
                  </div>
                  
                  {/* Message Field */}
                  <div className="sm:col-span-2 relative">
                    <label className="block text-amber-100 mb-2 font-medium">Special Requests</label>
                    <div className="relative">
                      <FiMessageSquare className="absolute left-3 top-4 text-amber-400" />
                      <textarea
                        {...register('message')}
                        rows={4}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-800 border border-amber-800/50 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-100 placeholder-amber-700`}
                        placeholder="Dietary restrictions, celebrations, etc."
                      ></textarea>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="sm:col-span-2 mt-4">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full bg-gradient-to-r from-amber-700 to-amber-800 text-white font-medium py-4 px-6 rounded-lg transition-all ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        "Confirm Reservation"
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}