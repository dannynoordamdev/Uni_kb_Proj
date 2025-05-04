import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, Book, Info, Grid, List, X, Maximize2 } from 'lucide-react';

// Main component
export default function ManuscriptViewer() {
  const [manuscripts, setManuscripts] = useState([]);
  const [illuminations, setIlluminations] = useState([]);
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);
  
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // These would be your actual API endpoints
        const manuscriptsResponse = await fetch('/api/manuscripts');
        const manuscriptsData = await manuscriptsResponse.json();
        setManuscripts(manuscriptsData);
        
        if (manuscriptsData.length > 0) {
          setSelectedManuscript(manuscriptsData[0]);
          // Fetch illuminations for the first manuscript
          await fetchIlluminationsForManuscript(manuscriptsData[0].identifier);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const fetchIlluminationsForManuscript = async (manuscriptIdentifier) => {
    try {
      // This would be your actual API endpoint to get illuminations by manuscript ID
      const illuminationsResponse = await fetch(`/api/illuminations?manuscriptId=${encodeURIComponent(manuscriptIdentifier)}`);
      const illuminationsData = await illuminationsResponse.json();
      setIlluminations(illuminationsData);
    } catch (error) {
      console.error('Error fetching illuminations:', error);
      setIlluminations([]);
    }
  };

  const handleManuscriptSelect = async (manuscript) => {
    setSelectedManuscript(manuscript);
    await fetchIlluminationsForManuscript(manuscript.identifier);
  };
  
  const openLightbox = (illumination) => {
    setLightboxImage(illumination);
  };
  
  const closeLightbox = () => {
    setLightboxImage(null);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading manuscript data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Medieval Manuscript Explorer</h1>
      
      {/* Manuscript Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select a Manuscript</h2>
        <div className="flex flex-wrap gap-4">
          {manuscripts.slice(0, 5).map((manuscript) => (
            <button
              key={manuscript.recordIdentifier}
              onClick={() => handleManuscriptSelect(manuscript)}
              className={`px-4 py-2 rounded ${
                selectedManuscript?.recordIdentifier === manuscript.recordIdentifier
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {manuscript.title || manuscript.identifier}
            </button>
          ))}
        </div>
      </div>
      
      {/* Selected Manuscript Details */}
      {selectedManuscript && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">{selectedManuscript.title}</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Book className="text-blue-600" size={20} />
                <span className="font-semibold">Identifier:</span> {selectedManuscript.identifier}
              </div>
              
              {selectedManuscript.creator && (
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-blue-600" size={20} />
                  <span className="font-semibold">Creator:</span> {selectedManuscript.creator}
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-blue-600" size={20} />
                <span className="font-semibold">Date:</span> {selectedManuscript.date}
              </div>
              
              {selectedManuscript.spatial && (
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-blue-600" size={20} />
                  <span className="font-semibold">Origin:</span> {selectedManuscript.spatial}
                </div>
              )}
            </div>
            
            <div>
              {selectedManuscript.format && (
                <div className="mb-2">
                  <span className="font-semibold">Format:</span> {selectedManuscript.format}
                </div>
              )}
              
              {selectedManuscript.extent && (
                <div className="mb-2">
                  <span className="font-semibold">Dimensions:</span> {selectedManuscript.extent}
                </div>
              )}
              
              {selectedManuscript.medium && (
                <div className="mb-2">
                  <span className="font-semibold">Medium:</span> {selectedManuscript.medium}
                </div>
              )}
              
              {selectedManuscript.language && (
                <div className="mb-2">
                  <span className="font-semibold">Language:</span> {selectedManuscript.language}
                </div>
              )}
            </div>
          </div>
          
          {selectedManuscript.description && (
            <div className="mt-4">
              <span className="font-semibold">Description:</span>
              <p className="mt-1">{selectedManuscript.description}</p>
            </div>
          )}
          
          {selectedManuscript.provenance && (
            <div className="mt-4">
              <span className="font-semibold">Provenance:</span>
              <p className="mt-1">{selectedManuscript.provenance}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Illuminations Gallery */}
      {selectedManuscript && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Illuminations ({illuminations.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
                title="Grid View"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
                title="List View"
              >
                <List size={20} />
              </button>
            </div>
          </div>
          
          {illuminations.length === 0 ? (
            <div className="text-center py-16 bg-gray-100 rounded-lg">
              <p className="text-lg text-gray-600">No illuminations found for this manuscript.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {illuminations.map((illumination) => (
                <div
                  key={illumination.recordIdentifier}
                  className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openLightbox(illumination)}
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {illumination.thumbnail ? (
                      <img
                        src={illumination.thumbnail}
                        alt={illumination.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-500">No image</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2" title={illumination.title}>
                      {illumination.title || 'Untitled'}
                    </h3>
                    {illumination.creator && (
                      <p className="text-xs text-gray-600 mt-1">{illumination.creator}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y bg-white rounded-lg shadow">
              {illuminations.map((illumination) => (
                <div
                  key={illumination.recordIdentifier}
                  className="flex p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => openLightbox(illumination)}
                >
                  <div className="w-24 h-24 bg-gray-200 flex-shrink-0 mr-4">
                    {illumination.thumbnail ? (
                      <img
                        src={illumination.thumbnail}
                        alt={illumination.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">No image</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{illumination.title || 'Untitled'}</h3>
                    {illumination.creator && (
                      <p className="text-sm text-gray-600">{illumination.creator}</p>
                    )}
                    {illumination.date && (
                      <p className="text-sm text-gray-600">{illumination.date}</p>
                    )}
                    {illumination.type && (
                      <p className="text-xs text-gray-500 mt-1">{illumination.type}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-auto">
            <button
              onClick={closeLightbox}
              className="absolute top-2 right-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300 z-10"
            >
              <X size={20} />
            </button>
            
            <div className="p-6">
              <div className="bg-gray-100 flex items-center justify-center mb-4 h-96">
                <img
                  src={lightboxImage.illustration || lightboxImage.thumbnail}
                  alt={lightboxImage.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              <h3 className="text-xl font-bold mb-2">{lightboxImage.title || 'Untitled'}</h3>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {lightboxImage.creator && (
                  <div>
                    <span className="font-semibold">Creator:</span> {lightboxImage.creator}
                  </div>
                )}
                
                {lightboxImage.date && (
                  <div>
                    <span className="font-semibold">Date:</span> {lightboxImage.date}
                  </div>
                )}
                
                {lightboxImage.type && (
                  <div>
                    <span className="font-semibold">Type:</span> {lightboxImage.type}
                  </div>
                )}
                
                {lightboxImage.folio && (
                  <div>
                    <span className="font-semibold">Folio:</span> {lightboxImage.folio}
                  </div>
                )}
                
                {lightboxImage.subject && (
                  <div className="md:col-span-2">
                    <span className="font-semibold">Subject:</span> {lightboxImage.subject}
                  </div>
                )}
                
                {lightboxImage.hasPart && (
                  <div>
                    <span className="font-semibold">Part:</span> {lightboxImage.hasPart}
                  </div>
                )}
                
                {lightboxImage.spatial && (
                  <div>
                    <span className="font-semibold">Location:</span> {lightboxImage.spatial}
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <a
                    href={lightboxImage.identifier}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Maximize2 size={16} /> View original source
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}