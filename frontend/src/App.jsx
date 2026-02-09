import React, { useState } from 'react';
import axios from 'axios';
import { Search, Download, Loader2, Sparkles, TrendingUp, Users } from 'lucide-react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const fetchLeads = async () => {
    if (!city) return alert("Please enter a city");
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/prospect?city=${city}`);
      setLeads(response.data.leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      alert("Failed to fetch leads. Is the backend running?");
    }
    setLoading(false);
  };

  const downloadExcel = async () => {
    setDownloadLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/download-excel?city=${city}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Remap_Leads_${city}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Download failed");
    }
    setDownloadLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') fetchLeads();
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed -bottom-8 left-1/2 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="relative z-10 w-full">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="w-full mb-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              {/* Logo and Title Section */}
              <div className="flex items-center gap-4 md:gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-30"></div>
                  <img src="/remap.png" alt="Remap Logo" className="w-54 h-24 md:w-60 md:h-40 relative z-10 drop-shadow-xl" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 bg-clip-text text-transparent">
                    Remap Intelligence
                  </h1>
                  <p className="text-green-600 font-medium flex items-center gap-2 mt-2">
                    <Sparkles size={16} />
                    AI-Powered Neuro-Rehab Prospecting
                  </p>
                </div>
              </div>

              {/* Character Logo */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-3xl blur-2xl opacity-25"></div>
                <img src="/reba3.png" alt="Reba Character" className="w-32 h-auto relative z-10 drop-shadow-2xl" />
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white bg-opacity-60 backdrop-blur-md border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-green-600 text-sm font-semibold">Total Prospects</p>
                    <p className="text-2xl font-bold text-green-900">{leads.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white bg-opacity-60 backdrop-blur-md border border-emerald-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <TrendingUp className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="text-emerald-600 text-sm font-semibold">Growth Ready</p>
                    <p className="text-2xl font-bold text-emerald-900">Ready</p>
                  </div>
                </div>
              </div>
              <div className="bg-white bg-opacity-60 backdrop-blur-md border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Sparkles className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-green-600 text-sm font-semibold">AI Insights</p>
                    <p className="text-2xl font-bold text-green-900">Live</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="w-full mb-8">
            <div className="bg-white bg-opacity-70 backdrop-blur-lg border border-green-200 rounded-2xl shadow-xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Enter Target City (e.g., Kochi, Bangalore)" 
                  className="flex-grow px-6 py-4 border-2 border-green-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 text-slate-700 placeholder-green-400 transition-all duration-300 font-medium"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  onClick={fetchLeads}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
                  <span className="hidden md:inline">{loading ? 'Scouting...' : 'Find Leads'}</span>
                  <span className="md:hidden">{loading ? 'Searching...' : 'Search'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="w-full bg-white bg-opacity-70 backdrop-blur-lg rounded-2xl shadow-xl border border-green-200 overflow-hidden hover:shadow-2xl transition-all duration-300 mb-10">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-200 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-green-900 text-lg">
                  Prospect List 
                  {leads.length > 0 && (
                    <span className="ml-2 inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {leads.length} Found
                    </span>
                  )}
                </h2>
              </div>
              {leads.length > 0 && (
                <button onClick={downloadExcel} disabled={downloadLoading} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50">
                  {downloadLoading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  {downloadLoading ? 'Exporting...' : 'Export Excel'}
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm uppercase tracking-wider border-b-2 border-green-300">
                    <th className="p-5 font-bold">Clinic Name</th>
                    <th className="p-5 font-bold">Specialty Focus</th>
                    <th className="p-5 font-bold">Contact Number</th>
                    <th className="p-5 font-bold text-right">Website</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-100">
                  {leads.length === 0 && !loading && (
                    <tr>
                      <td colSpan="4" className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Search className="text-green-300" size={48} />
                          <p className="text-green-500 font-semibold text-lg">Enter a city to start discovering prospects</p>
                          <p className="text-green-400 text-sm">Your AI-powered prospecting assistant is ready</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {leads.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 border-b border-green-100">
                      <td className="p-5 font-semibold text-green-900">{lead.name}</td>
                      <td className="p-5 text-green-700">{lead.specialty}</td>
                      <td className="p-5 text-green-700 font-medium">{lead.contact_number}</td>
                      <td className="p-5 text-right">
                        <a href={lead.website} target="_blank" rel="noreferrer" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 inline-block hover:shadow-lg transform hover:scale-105">
                          Visit Site
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full text-center pb-8">
            <p className="text-green-600 font-medium">Powered by AI Intelligence • Your Trusted Prospecting Partner</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;