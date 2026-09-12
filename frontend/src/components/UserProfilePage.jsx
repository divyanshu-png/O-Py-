import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PRESET_AVATARS = [
  { id: 'dev1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', label: 'Cyber Dev' },
  { id: 'dev2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', label: 'Algo Master' },
  { id: 'dev3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', label: 'Code Ninja' },
  { id: 'dev4', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', label: 'Pythonista' },
];

const UserProfilePage = () => {
  const { user, loginUser, setScreen } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || user?.username || '');
  const [bio, setBio] = useState(user?.bio || 'Passionate Python & DSA Practitioner.');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || PRESET_AVATARS[0].url);
  const [favoriteTopics, setFavoriteTopics] = useState(user?.favorite_topics || 'Python, Dynamic Programming, Graphs');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [copiedShare, setCopiedShare] = useState(false);

  // Fetch latest profile data from DB on load
  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!user?.user_id) return;
      try {
        const res = await axios.get('/api/profile/', {
          params: { user_id: user.user_id }
        });
        if (res.data) {
          setFullName(res.data.full_name || user.username);
          setBio(res.data.bio || 'Passionate Python & DSA Practitioner.');
          setAvatarUrl(res.data.avatar_url || PRESET_AVATARS[0].url);
          setFavoriteTopics(res.data.favorite_topics || 'Python, Dynamic Programming, Graphs');
        }
      } catch (err) {
        console.error('Failed to load profile details.');
      }
    };
    fetchLatestProfile();
  }, [user?.user_id]);

  const getBadgeInfo = (rank) => {
    if (rank >= 2150) return { title: 'Guardian 🛡️', color: 'bg-danger text-white' };
    if (rank >= 1850) return { title: 'Knight ⚔️', color: 'bg-amber-glow' };
    return { title: 'Contestant 🧩', color: 'bg-orange-glow' };
  };

  const badgeInfo = getBadgeInfo(user?.rank || 1500);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setLoading(true);

    try {
      const payload = {
        user_id: user?.user_id,
        full_name: fullName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim(),
        favorite_topics: favoriteTopics.trim()
      };

      const res = await axios.post('/api/profile/update/', payload);

      if (res.data && res.data.status === 'success') {
        setMsg({ type: 'success', text: 'Profile details updated and saved to database!' });
        loginUser({
          ...user,
          ...res.data.profile
        });
      } else {
        setMsg({ type: 'danger', text: res.data.message || 'Failed to save profile.' });
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Server update error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleShareCard = () => {
    const shareText = `🚀 Check out my O(Py) DSA Profile!\n\n👤 ${fullName} (@${user?.username})\n🏆 Rating: ${user?.rank || 1500} (${badgeInfo.title})\n🧩 Solved: ${user?.questions_solved || 0} Questions\n💬 "${bio}"\n\nJoin the DSA Challenge: http://localhost:5173`;
    
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="container-fluid py-4 font-mono">
      {/* Header */}
      <div className="main-header d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-orange-glow px-3 py-1 font-mono text-uppercase">Student Account Settings</span>
          </div>
          <h1 className="fw-bold display-6 text-white mb-1 font-mono">
            👤 User Details & Shareable Profile Card
          </h1>
          <p className="text-offwhite mb-0 font-mono fw-semibold">
            Customize your bio, photo, and share your DSA rank card with friends
          </p>
        </div>

        <button
          onClick={() => setScreen('start_test')}
          className="btn btn-outline-secondary text-offwhite d-flex align-items-center gap-2 rounded-3 font-mono"
        >
          <i className="bi bi-arrow-left"></i>
          Back to Dashboard
        </button>
      </div>

      <div className="row g-4">
        {/* Left Column: Edit Form */}
        <div className="col-lg-6">
          <div className="rounded-box h-100">
            <h4 className="fw-bold text-white mb-3">✏️ Edit Profile Information</h4>
            <p className="text-offwhite small mb-4">
              Update your account details below. All updates persist directly to the database.
            </p>

            {msg.text && (
              <div className={`alert alert-${msg.type} py-2.5 px-3 mb-4 bg-dark border-${msg.type} text-${msg.type}`}>
                <i className={`bi ${msg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div className="mb-3">
                <label className="form-label text-offwhite fw-semibold">Full Name / Display Name</label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-offwhite fw-semibold">Profile Bio & Quote</label>
                <textarea
                  className="form-control bg-dark text-white border-secondary"
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Mastering Python Data Structures & Algorithms..."
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label text-offwhite fw-semibold">Favorite Topics</label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  value={favoriteTopics}
                  onChange={(e) => setFavoriteTopics(e.target.value)}
                  placeholder="e.g. Python, Graphs, Dynamic Programming"
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-offwhite fw-semibold mb-2">Choose Avatar Photo</label>
                <div className="d-flex flex-wrap gap-3 mb-3">
                  {PRESET_AVATARS.map((av) => (
                    <img
                      key={av.id}
                      src={av.url}
                      alt={av.label}
                      className={`rounded-circle border border-2 cursor-pointer ${avatarUrl === av.url ? 'border-orange shadow-lg scale-105' : 'border-secondary opacity-75'}`}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => setAvatarUrl(av.url)}
                      title={av.label}
                    />
                  ))}
                </div>

                <label className="form-label text-offwhite small fw-semibold">Or Custom Image URL</label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-gradient-primary w-100 py-3 font-mono fw-bold d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Saving to DB...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save2-fill"></i>
                    Save & Update Database
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Shareable Profile Card */}
        <div className="col-lg-6">
          <div className="rounded-box h-100 d-flex flex-column justify-content-between position-relative overflow-hidden" style={{ border: '1px solid var(--accent-orange-light)' }}>
            <div className="position-absolute top-0 end-0 p-3 opacity-10">
              <i className="bi bi-code-slash text-orange" style={{ fontSize: '10rem' }}></i>
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
                <span className="badge bg-orange-glow text-orange px-3 py-1 font-mono">OFFICIAL O(Py) BADGE</span>
                <span className="text-offwhite small font-mono">Verified Practitioner</span>
              </div>

              {/* Avatar & Info */}
              <div className="d-flex align-items-center gap-4 mb-4">
                <img
                  src={avatarUrl || PRESET_AVATARS[0].url}
                  alt={fullName}
                  className="rounded-circle border border-2 border-orange p-1 shadow-lg"
                  style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                />
                <div>
                  <h3 className="fw-bold text-white mb-0">{fullName || user?.username}</h3>
                  <p className="text-orange font-mono mb-1">@{user?.username}</p>
                  <span className={`badge ${badgeInfo.color} px-3 py-1 font-mono`}>
                    {badgeInfo.title}
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="stat-card">
                    <small className="text-offwhite d-block mb-1">LeetCode Rating</small>
                    <span className="fs-3 fw-bold text-orange-bright">{user?.rank || 1500}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-card">
                    <small className="text-offwhite d-block mb-1">Questions Solved</small>
                    <span className="fs-3 fw-bold text-success">{user?.questions_solved || 0}</span>
                  </div>
                </div>
              </div>

              {/* Bio Quote */}
              <div className="p-3 bg-dark rounded-3 border border-secondary mb-3">
                <small className="text-orange font-mono d-block mb-1">Bio / Practitioner Statement:</small>
                <p className="text-white mb-0 italic" style={{ fontSize: '0.95rem' }}>
                  "{bio}"
                </p>
              </div>

              {/* Topics */}
              <div className="mb-3">
                <small className="text-offwhite d-block mb-2 font-mono">Favorite Categories:</small>
                <div className="d-flex flex-wrap gap-2">
                  {favoriteTopics.split(',').map((t, idx) => (
                    <span key={idx} className="badge bg-dark border border-secondary text-offwhite font-mono px-2.5 py-1">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-top border-secondary">
              <button
                onClick={handleShareCard}
                className="btn btn-outline-orange w-100 py-3 font-mono fw-bold d-flex align-items-center justify-content-center gap-2"
              >
                <i className={`bi ${copiedShare ? 'bi-check-circle-fill text-success' : 'bi-share-fill'}`}></i>
                {copiedShare ? 'Copied Shareable Card to Clipboard!' : 'Share Profile Card with Friends'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
