import { useState } from "react";

export default function ContextManager({ 
  contextSources, 
  addContextSource, 
  removeContextSource,
  isSessionActive,
  isLoadingDefaultSources
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAddingContext, setIsAddingContext] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedPreview, setExpandedPreview] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && (content || selectedFile)) {
      addContextSource({ 
        title, 
        content: selectedFile ? "Loading from file..." : content 
      });
      
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          // Update the latest added context source with file content
          const fileContent = event.target.result;
          addContextSource({ title, content: fileContent });
          // Remove the placeholder
          removeContextSource(contextSources.length);
        };
        reader.readAsText(selectedFile);
      }
      
      // Reset form
      setTitle("");
      setContent("");
      setSelectedFile(null);
      setIsAddingContext(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const toggleExpandedPreview = (index) => {
    setExpandedPreview(expandedPreview === index ? null : index);
  };

  return (
    <div className="mb-6 border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Context Sources</h3>
      
      {isLoadingDefaultSources ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
          <p>Loading context sources...</p>
        </div>
      ) : contextSources.length > 0 ? (
        <div className="mb-4">
          {contextSources.map((source, index) => (
            <div key={index} className="p-3 border-b hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-blue-600">{source.title}</div>
                  {source.summary && (
                    <p className="text-sm text-gray-600 mt-1">{source.summary}</p>
                  )}
                </div>
                <button 
                  className="text-red-500 hover:text-red-700 ml-2"
                  onClick={() => removeContextSource(index)}
                  disabled={isSessionActive}
                >
                  ×
                </button>
              </div>
              
              <div className="flex mt-2 space-x-2 text-sm">
                {source.sourceUrl && (
                  <a 
                    href={source.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Source
                  </a>
                )}
              </div>
              
              {expandedPreview === index && (
                <div className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto max-h-48">
                  {source.content.substring(0, 300)}
                  {source.content.length > 300 && "..."}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-4">No context sources added yet.</p>
      )}

      {isAddingContext ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              placeholder="Case Study Title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded mt-1 h-32"
              placeholder="Paste or type context content here"
              disabled={selectedFile !== null}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Or Upload a File</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded mt-1"
              accept=".txt,.md,.json"
              disabled={content.length > 0}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              disabled={isSessionActive || (!content && !selectedFile)}
            >
              Add Context
            </button>
            <button
              type="button"
              className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
              onClick={() => setIsAddingContext(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          onClick={() => setIsAddingContext(true)}
          disabled={isSessionActive}
        >
          Add Context Source
        </button>
      )}
      
      {isSessionActive && contextSources.length > 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Context sources are loaded and active in the current session.
        </p>
      )}
      
      {isSessionActive && contextSources.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          No context sources were loaded for this session.
        </p>
      )}
    </div>
  );
} 