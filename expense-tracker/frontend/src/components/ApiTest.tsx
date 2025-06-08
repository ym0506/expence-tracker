import React, { useState } from 'react';
import api from '../services/api';

const ApiTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      console.log('Testing API connection...');
      const response = await api.get('/test');
      setResult(`✅ 연결 성공: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      console.error('API Test Error:', error);
      setResult(`❌ 연결 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      console.log('Testing login...');
      const response = await api.post('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      setResult(`✅ 로그인 성공: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      console.error('Login Test Error:', error);
      setResult(`❌ 로그인 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">API 연결 테스트</h3>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '테스트 중...' : 'API 연결 테스트'}
        </button>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? '테스트 중...' : '로그인 테스트'}
        </button>
      </div>
      
      {result && (
        <div className="p-3 bg-white border rounded">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;