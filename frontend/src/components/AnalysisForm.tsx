import { useState, useEffect } from 'react';
import { fetchExamples } from '../lib/api';
import type { Example } from '../types';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 13,
  background: '#13131f',
  border: '1px solid rgba(108,92,231,0.18)',
  borderRadius: 10,
  color: '#e2e2f0',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#6c6c8a',
  marginBottom: 6,
  display: 'block',
};

interface Props {
  onSubmit: (req: any) => void;
  loading: boolean;
}

export function AnalysisForm({ onSubmit, loading }: Props) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [models, setModels] = useState<string[]>(['gpt-4']);
  const [examples, setExamples] = useState<Example[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load examples
  useEffect(() => {
    fetchExamples()
      .then(setExamples)
      .catch(() => {
        console.log('Using fallback examples');
      });
  }, []);

  const loadExample = (ex: any) => {
    setQuery(ex.query);
    setResponse(ex.response);
    setModels([ex.model_name]);
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      query: query.trim() || 'Summarize the document',
      response: response.trim(),
      model_name: models[0],  // primary
      model_names: models,    // multi-model
    });
  };

  // Form valid?
  const ready =
    !loading &&
    models.length > 0 &&
    (response.trim().length >= 10 || file !== null);

  // Fallback examples
  const fallbackExamples = [
    {
      id: 1,
      title: 'Einstein facts',
      query: 'Tell me about Albert Einstein',
      response:
        'Albert Einstein was born in 1879 in Germany. He developed relativity and won the Nobel Prize in 1921.',
      model_name: 'gpt-4',
    },
    {
      id: 2,
      title: 'Python language',
      query: 'Explain Python',
      response:
        'Python was created by Guido van Rossum in 1991. It is a high-level programming language.',
      model_name: 'llama-3',
    },
    {
      id: 3,
      title: 'Machine learning',
      query: 'What is machine learning?',
      response:
        'Machine learning is a subset of AI that enables systems to learn from data.',
      model_name: 'gemini-pro',
    },
    {
      id: 4,
      title: 'Tech founders',
      query: 'Who founded major tech companies?',
      response:
        'Apple was founded by Steve Jobs, Microsoft by Bill Gates, and Amazon by Jeff Bezos.',
      model_name: 'gpt-4',
    },
  ];

  const displayExamples = examples.length > 0 ? examples : fallbackExamples;

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
    >
      {/* Upload PDF */}
      <div>
        <label style={labelStyle}>Upload PDF</label>
        <input
          type="file"
          accept=".pdf"
          onChange={async (e) => {
            const selected = e.target.files?.[0];
            if (!selected) return;

            setFile(selected);

            try {
              setUploading(true);

              const formData = new FormData();
              formData.append('file', selected);

              const res = await fetch('/api/v1/upload', {
                method: 'POST',
                body: formData,
              });

              const data = await res.json();
              setResponse(data.text);
            } catch (err) {
              console.error('Upload failed', err);
            } finally {
              setUploading(false);
            }
          }}
        />
      </div>

      {/* Examples */}
      <div>
        <p style={{ fontSize: 13, color: '#a0a0c0', marginBottom: 10, fontWeight: 600 }}>
          Try examples
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {displayExamples.map((ex: any) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => loadExample(ex)}
              style={{
                padding: '12px',
                borderRadius: 10,
                border: '1px solid rgba(108,92,231,0.2)',
                background: '#13131f',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e2f0', marginBottom: 4 }}>
                {ex.title}
              </p>

              <p style={{ fontSize: 10, color: '#6c6c8a' }}>
                {ex.model_name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Models */}
      <div>
        <label style={labelStyle}>Select Models</label>

        {['gpt-4', 'llama-3', 'gemini-pro'].map((m) => (
          <label
            key={m}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#c8c8e0',
              marginBottom: 6,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={models.includes(m)}
              onChange={() =>
                setModels((prev) =>
                  prev.includes(m)
                    ? prev.filter((x) => x !== m)
                    : [...prev, m]
                )
              }
            />
            {m}
          </label>
        ))}
      </div>

      {/* Query */}
      <div>
        <label style={labelStyle}>Query</label>
        <input
          style={inputStyle}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Response */}
      <div>
        <label style={labelStyle}>Response</label>
        <textarea
          style={{ ...inputStyle, minHeight: 140 }}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!ready}
        style={{
          padding: '12px',
          borderRadius: 10,
          border: 'none',
          background: ready ? '#6c5ce7' : '#333',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        {uploading
          ? 'Uploading PDF...'
          : loading
          ? 'Analyzing...'
          : 'Detect Hallucinations'}
      </button>
    </form>
  );
}