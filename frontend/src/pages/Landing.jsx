import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, Users, Star, FileText, Languages, Zap, CheckCircle, ArrowRight, Sparkles, GraduationCap, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <FileText className="w-10 h-10" />,
      title: "PDF Analysis",
      description: "Upload your textbooks and notes. Our AI instantly understands and analyzes your study materials.",
      color: "from-gray-500 to-cyan-500"
    },
    {
      icon: <Languages className="w-10 h-10" />,
      title: "Multi-Language Support",
      description: "Learn in your preferred language: Darija, Arabic, French, or English. Switch anytime!",
      color: "from-gray-500 to-pink-500"
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: "Smart AI Tutor",
      description: "Get instant, personalized explanations for any concept. Like having a private tutor 24/7.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Zap className="w-10 h-10" />,
      title: "Practice Exercises",
      description: "Auto-generate custom exercises and quizzes based on your study materials.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const benefits = [
    "Understand complex topics in minutes",
    "Study in your preferred language",
    "Get instant answers to any question",
    "Generate unlimited practice exercises",
    "Save hours of study time",
    "Improve your grades significantly"
  ];

  const stats = [
    { number: "10,000+", label: "Students" },
    { number: "50,000+", label: "Questions Answered" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/95 border-b border-gray-200 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="bg-black p-2 rounded-xl">
                <Brain className="w-7 h-7 text-white" />
              </div>
                <span className="text-2xl font-bold text-black">
                Taalim AI
              </span>
            </div>
            <div className="flex items-center space-x-6">
              {user ? (
                  <Link 
                    to="/dashboard" 
                    className="group relative px-6 py-3 bg-black text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-xl"
                  >
                  <span className="relative z-10 flex items-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 font-semibold hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                    <Link 
                      to="/register" 
                      className="group relative px-6 py-3 bg-black text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-xl"
                    >
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started Free
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-gray-100 to-pink-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-gray-700">AI-Powered Learning Platform</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Personal
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AI Study Assistant
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Transform the way you learn with AI-powered explanations in Darija, French, or Arabic. 
                Upload PDFs, ask questions, and master any subject faster.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link 
                  to="/register" 
                  className="group px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    Start Learning Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link 
                  to="/login" 
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-primary hover:text-primary transition-all duration-300"
                >
                  Login
                </Link>
              </div>

              <div className="flex items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Free forever</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                {/* Floating cards effect */}
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl"></div>
                
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200">
                  <div className="space-y-4">
                    {/* Chat message example */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-200 rounded-2xl p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Student</p>
                          <p className="text-gray-600">Explain photosynthesis in simple terms</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Taalim AI</p>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            Photosynthesis is like cooking with sunlight! Plants use sunlight, water, and CO₂ to make food (glucose) and release oxygen...
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Feature badges */}
                    <div className="flex gap-2 pt-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Instant Answers</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Multi-Language</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">24/7 Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white border-y border-gray-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-black mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Everything You Need to
                <span className="block text-black">
                  Excel in Your Studies
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful AI features designed specifically for Moroccan students
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Why Students Love Taalim AI
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of successful students who are already achieving better grades with AI-powered learning.
              </p>
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-medium">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-primary via-blue-600 to-secondary rounded-3xl p-12 lg:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Limited Time Offer</span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join 10,000+ Moroccan students who are already learning smarter, not harder with Taalim AI
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="group px-8 py-4 bg-white text-primary rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    Start Free Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link 
                  to="/login" 
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                >
                  Login
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Free forever</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Taalim AI</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 Taalim AI. All rights reserved. Made with ❤️ for Moroccan students.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;