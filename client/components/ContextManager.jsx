import { useState } from "react";

export default function ContextManager({ 
  contextSources, 
  addContextSource, 
  removeContextSource,
  isSessionActive
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAddingContext, setIsAddingContext] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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

  return (
    <div className="mb-6 border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Context Sources</h3>
      
      {contextSources.length > 0 ? (
        <div className="mb-4">
          {contextSources.map((source, index) => (
            <div key={index} className="flex justify-between items-center p-2 border-b">
              <div className="truncate">
                <strong>{source.title}</strong>
                <button 
                  className="ml-2 text-sm text-blue-500 hover:underline"
                  onClick={() => {
                    alert(source.content.substring(0, 500) + 
                          (source.content.length > 500 ? "..." : ""));
                  }}
                >
                  preview
                </button>
              </div>
              <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => removeContextSource(index)}
                disabled={isSessionActive}
              >
                ×
              </button>
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