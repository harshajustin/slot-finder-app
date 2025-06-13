import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { 
  CalendarDays, Clock, Users, CheckCircle, ArrowRight, Star, 
  Calendar, BookOpen, MessageSquare, Award, Zap, Heart
} from 'lucide-react';

// Add custom styles
import './landing.css';

const Landing = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const heroImageAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring" as const,
        stiffness: 100,
        delay: 0.2,
        duration: 0.8
      }
    }
  };
  
  const pulseAnimation = {
    animate: {
      scale: [1, 1.05, 1],
      transition: { 
        repeat: Infinity, 
        repeatType: "reverse" as const, 
        duration: 2 
      }
    }
  };

  const testimonialsData = [
    {
      name: "Alex Johnson",
      role: "Regular Customer",
      text: "Slot Finder has revolutionized how I schedule appointments. No more phone calls or back-and-forth emails!",
      avatar: "https://i.pravatar.cc/100?img=1",
      rating: 5
    },
    {
      name: "Sarah Miller",
      role: "Business Owner",
      text: "As a business owner, I needed something simple that my clients could use. Slot Finder delivers exactly that!",
      avatar: "https://i.pravatar.cc/100?img=5",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Professional",
      text: "The ability to save my details for future bookings is such a time-saver. Clean interface, easy to navigate.",
      avatar: "https://i.pravatar.cc/100?img=3",
      rating: 4
    }
  ];
  
  const statsData = [
    { label: "Happy Users", value: "50k+", icon: <Users className="w-5 h-5 text-blue-600" /> },
    { label: "Bookings Made", value: "1M+", icon: <Calendar className="w-5 h-5 text-indigo-600" /> },
    { label: "Time Saved", value: "10k hrs", icon: <Clock className="w-5 h-5 text-green-600" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-bold text-xl text-gray-900">Slot Finder</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">How It Works</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Testimonials</a>
            <Link to="/book?tab=manage" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Manage Bookings</Link>
            <Button asChild size="sm" className="ml-4">
              <Link to="/book">Book Now</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <Button variant="outline" size="sm">
              <Link to="/book">Book Now</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-24 md:pt-36 md:pb-32 overflow-hidden">
        <motion.div 
          className="container mx-auto px-4 sm:px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <motion.h1 
                variants={fadeIn}
                className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight"
              >
                Book Smarter <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Not Harder
                </span>
              </motion.h1>
              <motion.p 
                variants={fadeIn}
                className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl"
              >
                Schedule appointments with ease using our intuitive booking system. Find available slots, book instantly, and manage your appointments all in one place.
              </motion.p>
              <motion.div 
                variants={fadeIn}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button asChild size="lg" className="px-8 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-shadow">
                  <Link to="/book" className="flex items-center gap-2">
                    Book an Appointment <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8 py-6 text-base rounded-full hover:bg-blue-50 transition-colors">
                  <Link to="/book?tab=manage">Manage Bookings</Link>
                </Button>
              </motion.div>

              <motion.div 
                variants={fadeIn}
                className="mt-12 flex items-center gap-6"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                      <img 
                        src={`https://i.pravatar.cc/100?img=${i}`} 
                        alt="User avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    <span className="font-semibold">4.9/5</span> from 2,000+ users
                  </span>
                </div>
              </motion.div>
            </div>
            <motion.div 
              className="hidden lg:flex justify-center lg:justify-end"
              variants={heroImageAnimation}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-30"></div>                <motion.img 
                  src="/calendar-hero.svg"
                  alt="Calendar with available booking slots"
                  className="relative z-10 max-w-md w-full drop-shadow-2xl"
                  animate="animate"
                  variants={pulseAnimation}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute hidden lg:block top-24 left-12 w-24 h-24 rounded-full bg-blue-100 opacity-70 animate-pulse"></div>
        <div className="absolute hidden lg:block bottom-20 right-16 w-32 h-32 rounded-full bg-indigo-100 opacity-70 animate-pulse" style={{animationDelay: "1s"}}></div>
        <div className="absolute hidden lg:block top-40 right-32 w-16 h-16 rounded-full bg-green-100 opacity-70 animate-pulse" style={{animationDelay: "2s"}}></div>
      </section>

      {/* Stats Section */}
      <motion.section 
        className="py-12 bg-white/90 backdrop-blur border-t border-b border-blue-100"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statsData.map((stat, i) => (
              <motion.div 
                key={i} 
                className="flex items-center justify-center py-6"
                variants={fadeIn}
              >
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mr-4">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-500">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features"
        className="py-20 bg-gradient-to-b from-white to-blue-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Designed for <span className="text-blue-600">Simplicity</span>
            </h2>
            <p className="text-xl text-gray-600">
              Our platform makes booking appointments effortless with these powerful features
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: <Calendar className="w-6 h-6 text-blue-600" />,
                title: "Smart Calendar",
                description: "See all available slots at a glance with our intuitive calendar interface"
              },
              {
                icon: <BookOpen className="w-6 h-6 text-blue-600" />,
                title: "Save User Details",
                description: "Enter your details once and reuse them for all future bookings"
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
                title: "Instant Confirmations",
                description: "Receive booking confirmations immediately, no waiting required"
              },
              {
                icon: <Users className="w-6 h-6 text-blue-600" />,
                title: "User-Friendly",
                description: "Designed for everyone, no technical expertise needed"
              },
              {
                icon: <Zap className="w-6 h-6 text-blue-600" />,
                title: "Lightning Fast",
                description: "Book appointments in seconds, not minutes"
              },
              {
                icon: <Heart className="w-6 h-6 text-blue-600" />,
                title: "Customer First",
                description: "Built with your needs in mind, simplifying the booking process"
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="group"
              >
                <Card className="border-0 shadow-lg bg-white backdrop-blur h-full hover:shadow-xl transition-shadow duration-300 hover:border-blue-200 group-hover:translate-y-[-5px] transition-transform">
                  <CardContent className="pt-8 pb-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        id="how-it-works"
        className="py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It <span className="text-blue-600">Works</span>
            </h2>
            <p className="text-xl text-gray-600">
              Book your appointment in three simple steps
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <CalendarDays className="w-7 h-7 text-blue-600" />,
                title: "Select a Date",
                description: "Browse our calendar to find a date that works for you. We show available slots in real-time."
              },
              {
                icon: <Clock className="w-7 h-7 text-blue-600" />,
                title: "Choose a Time Slot",
                description: "Select from available time slots that fit your schedule. Multiple options throughout the day."
              },
              {
                icon: <CheckCircle className="w-7 h-7 text-blue-600" />,
                title: "Confirm Your Booking",
                description: "Enter your details once and use them for future bookings. Receive instant confirmation."
              }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
              >
                <Card className="border shadow-md bg-white/80 backdrop-blur h-full hover:shadow-lg transition-all hover:bg-white/100">
                  <CardContent className="pt-8 pb-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-16 h-16 mb-6">
                        <div className="absolute inset-0 bg-blue-200 rounded-full blur-md opacity-70"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-bold text-3xl text-blue-600">{idx + 1}</span>
                        </div>
                      </div>
                      
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        {step.icon}
                      </div>
                      <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                      <p className="text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-6 flex justify-center">
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                      Learn More
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        id="testimonials"
        className="py-20 bg-gradient-to-b from-blue-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our <span className="text-blue-600">Users Say</span>
            </h2>
            <p className="text-xl text-gray-600">
              Don't take our word for it - hear from our satisfied users
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
              >
                <Card className="border bg-white shadow-md h-full hover:shadow-xl transition-all">
                  <CardContent className="pt-8 pb-6">
                    <div className="flex flex-col">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 mr-4 rounded-full overflow-hidden">
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.name}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="mb-4 flex">
                        {Array(5).fill(0).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 italic">"{testimonial.text}"</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 md:py-28"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl"></div>
            <div className="absolute inset-0 bg-grid-white/10 mask-image-gradient"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl shadow-2xl px-6 py-12 md:px-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-2xl"
              ></motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute -bottom-16 -left-12 w-56 h-56 bg-indigo-500 rounded-full opacity-20 blur-2xl"
              ></motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Schedule Your Appointment?</h2>
              <p className="text-blue-100 mb-8 text-lg max-w-xl mx-auto">
                Our simple booking system makes it easy to find and reserve your preferred time slot in just a few clicks.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button asChild size="lg" variant="secondary" className="text-blue-700 font-medium px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                  <Link to="/book" className="flex items-center gap-2">
                    Book Now <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>
              <div className="mt-6 text-blue-100 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Takes less than 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Clock className="inline-block mr-2 text-blue-600" /> 
                Slot Finder
              </h2>
              <p className="text-gray-600 mt-2 mb-4">Simple booking for everyone</p>
              <p className="text-gray-500 text-sm max-w-md">
                Our mission is to make appointment scheduling as simple as possible for everyone. No more back-and-forth emails or phone calls.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/book" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link to="/book?tab=manage" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Manage Bookings
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-blue-100 transition-colors rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-blue-100 transition-colors rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-blue-100 transition-colors rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Slot Finder. All rights reserved.</p>
            <div className="mt-2 flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-gray-500">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
