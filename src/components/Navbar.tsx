import { useNavigate } from '../lib/router';

export default function Navbar() {
  const { navigate } = useNavigate();
  return (
    <nav className="navbar">
      <button
        onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        className="text-2xl font-bold text-gradient"
      >
        RESUMIND
      </button>
      <button onClick={() => navigate('/upload')} className="primary-button w-fit px-6 py-2">
        Upload Resume
      </button>
    </nav>
  );
}
