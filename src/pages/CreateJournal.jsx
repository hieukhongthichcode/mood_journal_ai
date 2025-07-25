import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // ← Sửa đường dẫn nếu khác

function CreateJournal() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState(null);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext); // ← Lấy token đúng

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/journals', {
        title,
        content,
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // ← Token đúng
        }
      });

      console.log('Đã tạo:', response.data);

      setEmotion(response.data.data.mood);

    } catch (error) {
      console.error('Lỗi khi tạo bài viết:', error.response?.data || error.message);
      alert('Tạo bài viết thất bại');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Tạo bài viết mới</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Tiêu đề</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Nội dung</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Gửi bài viết
        </button>
      </form>

      {emotion && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-bold mb-2">Kết quả cảm xúc:</h3>
          <p><strong>Cảm xúc:</strong> {emotion.label}</p>
          <p><strong>Mức độ chắc chắn:</strong> {(emotion.score * 100).toFixed(2)}%</p>

          <button
            onClick={() => navigate('/home')}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Xem biểu đồ cảm xúc
          </button>
        </div>
      )}
    </div>
  );
}

export default CreateJournal;
