import React, { useState, useEffect } from 'react';
import { Book, Plus, Clock, Star, Eye, Download, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const Exercises = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorData, setGeneratorData] = useState({
    topic: '',
    subject: '',
    difficulty: 'medium',
    numberOfQuestions: 5
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await API.get('/exercises');
      setExercises(response.data.exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      toast.loading('Generating exercises...');
      const response = await API.post('/exercises/generate', generatorData);
      setExercises(prev => [response.data, ...prev]);
      setShowGenerator(false);
      setGeneratorData({
        topic: '',
        subject: '',
        difficulty: 'medium',
        numberOfQuestions: 5
      });
      toast.dismiss();
      toast.success('Exercises generated successfully!');
    } catch (error) {
      console.error('Error generating exercise:', error);
      toast.dismiss();
      toast.error('Failed to generate exercises');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
          <div className="flex items-center space-x-3">
          <div className="bg-black p-3 rounded-xl shadow-lg">
            <Book className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black">Practice Exercises</h1>
            <p className="text-gray-600 text-sm mt-1">Test your knowledge and improve</p>
          </div>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="group flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Generate Exercise</span>
        </button>
      </motion.div>

      {showGenerator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-gray-200 p-6 mb-6 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-900">Generate New Exercise</h3>
          </div>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={generatorData.topic}
                  onChange={(e) => setGeneratorData({...generatorData, topic: e.target.value})}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all"
                  placeholder="e.g., Calculus, Physics, History"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={generatorData.subject}
                  onChange={(e) => setGeneratorData({...generatorData, subject: e.target.value})}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all"
                  placeholder="e.g., Mathematics, Science, Literature"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={generatorData.difficulty}
                  onChange={(e) => setGeneratorData({...generatorData, difficulty: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={generatorData.numberOfQuestions}
                  onChange={(e) => setGeneratorData({...generatorData, numberOfQuestions: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-black text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold"
              >
                Generate
              </button>
              <button
                type="button"
                onClick={() => setShowGenerator(false)}
                className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {exercises.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-black/10 rounded-3xl mb-6 shadow-xl">
            <Book className="w-12 h-12 text-black" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No exercises yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Generate your first practice exercise to start learning and testing your knowledge</p>
          <button
            onClick={() => setShowGenerator(true)}
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold"
          >
            <Sparkles className="w-5 h-5" />
            Generate Exercise
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-black/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-black transition-colors">{exercise.title}</h3>
                  <p className="text-gray-600">{exercise.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase ${
                    exercise.difficulty === 'easy' ? 'bg-gray-200 text-gray-800' :
                    exercise.difficulty === 'medium' ? 'bg-gray-300 text-gray-800' :
                    'bg-gray-400 text-gray-800'
                  }`}>
                    {exercise.difficulty}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                    <Book className="w-4 h-4 text-black" />
                    <span className="font-medium text-gray-700">{exercise.subject}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(exercise.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110" title="View">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 hover:scale-110" title="Download">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Exercises;