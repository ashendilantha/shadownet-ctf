'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface FlagSubmitFormProps {
  challengeId: number;
  onSuccess?: () => void;
}

export default function FlagSubmitForm({ challengeId, onSuccess }: FlagSubmitFormProps) {
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/submissions', {
        challenge_id: challengeId,
        flag,
      });

      setIsCorrect(response.data.correct);
      setMessage(response.data.message);

      if (response.data.correct) {
        setFlag('');
        onSuccess?.();
      }
    } catch (error: any) {
      setIsCorrect(false);
      setMessage(error.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
      <div>
        <label htmlFor="flag">Enter Flag:</label>
        <input
          type="text"
          id="flag"
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="SHADOWNET{...}"
          disabled={loading}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Flag'}
      </button>

      {message && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            borderRadius: '5px',
            background: isCorrect ? '#d4edda' : '#f8d7da',
            color: isCorrect ? '#155724' : '#721c24',
          }}
        >
          {message}
        </div>
      )}
    </form>
  );
}
