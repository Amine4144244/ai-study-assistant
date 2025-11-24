import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Eye, Clock, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const MyPDFs = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      const response = await API.get('/pdfs');
      setPdfs(response.data.pdfs);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pdfId) => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      try {
        await API.delete(`/pdfs/${pdfId}`);
        setPdfs(pdfs.filter(pdf => pdf._id !== pdfId));
        toast.success('PDF deleted successfully');
      } catch (error) {
        console.error('Error deleting PDF:', error);
        toast.error('Failed to delete PDF');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your PDFs...</p>
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
          <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl shadow-lg shadow-primary/30">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">My PDFs</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your study materials</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-gray-700">{pdfs.length} documents</span>
        </div>
      </motion.div>

      {pdfs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl mb-6 shadow-xl">
            <FileText className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No PDFs uploaded yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Upload your textbooks and notes to start using AI-powered learning assistance</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-gray-700">Go to Ask AI to upload your first PDF</span>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {pdfs.map((pdf, index) => (
            <motion.div
              key={pdf._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/30 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-primary transition-colors">
                      {pdf.originalName}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center space-x-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 px-3 py-1 rounded-lg">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="font-medium">{pdf.pageCount} pages</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(pdf.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110" title="View">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 hover:scale-110" title="Download">
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(pdf._id)}
                    className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
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

export default MyPDFs;