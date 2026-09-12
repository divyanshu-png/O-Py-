import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Requirement 4: Bootstrap SVG as default profile photo for both admin and student login
const DEFAULT_STUDENT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23f97316" viewBox="0 0 16 16"><path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/><path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/></svg>`;
const DEFAULT_ADMIN_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23f97316" viewBox="0 0 16 16"><path d="M8 0c-.69 0-1.382.04-2.073.115C4.228.293 2.472.99 1.33 2.13 0 3.46 0 5.49 0 7.82V8c0 3.328 1.954 6.258 4.956 7.518L8 16l3.044-.482C14.046 14.258 16 11.328 16 8v-.18c0-2.33 0-4.36-1.33-5.69C13.528.99 11.772.293 10.073.115 9.382.04 8.69 0 8 0m0 1.5c.65 0 1.302.038 1.953.108 1.48.156 2.87.777 3.82 1.727C14.723 4.285 14.723 6 14.723 8c0 2.766-1.576 5.212-4.062 6.236L8 14.71l-2.661-.474C2.853 13.212 1.277 10.766 1.277 8c0-2 0-3.715.95-4.665.95-.95 2.34-1.571 3.82-1.727C6.698 1.538 7.35 1.5 8 1.5"/></svg>`;

const UserProfilePage = () => {
  const { user, loginUser, setScreen } = useAuth();

  const defaultSvg = user?.is_admin ? DEFAULT_ADMIN_SVG : DEFAULT_STUDENT_SVG;

  const [fullName, setFullName] = useState(user?.full_name || user?.username || '');
  const [bio, setBio] = useState(user?.bio || (user?.is_admin ? 'Platform Administrator & Instructor.' : 'Passionate Python & DSA Practitioner.'));
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url && !user.avatar_url.includes('unsplash') ? user.avatar_url : defaultSvg);
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
          setBio(res.data.bio || (user?.is_admin ? 'Platform Administrator & Instructor.' : 'Passionate Python & DSA Practitioner.'));
          setAvatarUrl(res.data.avatar_url && !res.data.avatar_url.includes('unsplash') ? res.data.avatar_url : defaultSvg);
          setFavoriteTopics(res.data.favorite_topics || 'Python, Dynamic Programming, Graphs');
        }
      } catch (err) {
        console.error('Failed to load profile details.');
      }
    };
    fetchLatestProfile();
  }, [user?.user_id, user?.is_admin, defaultSvg]);

  const getBadgeInfo = (rank) => {
    if (user?.is_admin) return { title: 'Administrator 🛡️', color: 'bg-orange-glow' };
    if (rank >= 2150) return { title: 'Guardian 🛡️', color: 'bg-danger text-white' };
    if (rank >= 1850) return { title: 'Knight ⚔️', color: 'bg-amber-glow' };
    return { title: 'Contestant 🧩', color: 'bg-orange-glow' };
  };

  const badgeInfo = getBadgeInfo(user?.rank || 1500);

  // Handle Photo File Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'danger', text: 'Please select a valid image file (PNG, JPG, JPEG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'danger', text: 'Image file size should be less than 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        setAvatarUrl(event.target.result);
        setMsg({ type: 'success', text: 'Photo uploaded! Click "Save & Update Database" to persist.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setLoading(true);

    try {
      const payload = {
        user_id: user?.user_id,
        full_name: fullName.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        favorite_topics: favoriteTopics.trim()
      };

      const res = await axios.post('/api/profile/update/', payload);

      if (res.data && res.data.status === 'success') {
        setMsg({ type: 'success', text: 'Profile photo and details updated in database!' });
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
    const shareText = user?.is_admin
      ? `🛡️ O(Py) Platform Administrator Profile\n\n👤 ${fullName} (@${user?.username})\n💬 "${bio}"\n\nManage DSA Examinations: http://localhost:5173`
      : `🚀 Check out my O(Py) DSA Profile!\n\n👤 ${fullName} (@${user?.username})\n🏆 Rating: ${user?.rank || 1500} (${badgeInfo.title})\n🧩 Solved: ${user?.questions_solved || 0} Questions\n💬 "${bio}"\n\nJoin the DSA Challenge: http://localhost:5173`;
    
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const activePhoto = avatarUrl || defaultSvg;

  return (
    <div className="container-fluid py-4 font-mono">
      {/* Requirement 2: Change "User Details & Shareable Profile Card" to "Admin Details" for Admin */}
      <div className="main-header d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          {user?.is_admin ? (
            <>
              {/* Requirement 1: Admin Profile tag */}
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-orange-glow px-3 py-1 font-mono text-uppercase">Admin Profile</span>
              </div>
              <h1 className="fw-bold display-6 text-white mb-0 font-mono">
                Admin Details
              </h1>
            </>
          ) : (
            <>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-orange-glow px-3 py-1 font-mono text-uppercase">Student Profile</span>
              </div>
              <h1 className="fw-bold display-6 text-white mb-1 font-mono">
                User Details & Shareable Profile Card
              </h1>
              <p className="text-offwhite mb-0 font-mono fw-semibold">
                Upload your profile photo, update your bio, and share your DSA rank badge card
              </p>
            </>
          )}
        </div>

        <button
          onClick={() => setScreen(user?.is_admin ? 'admin' : 'start_test')}
          className="btn btn-outline-secondary text-offwhite d-flex align-items-center gap-2 rounded-3 font-mono"
        >
          <i className="bi bi-arrow-left"></i>
          {user?.is_admin ? 'Back to Admin Panel' : 'Back to Dashboard'}
        </button>
      </div>

      <div className="row g-4">
        {/* Left Column: Edit Form */}
        <div className="col-lg-6">
          <div className="rounded-box h-100">
            <h4 className="fw-bold text-white mb-3">✏️ Edit {user?.is_admin ? 'Admin' : 'Profile'} Information</h4>
            <p className="text-offwhite small mb-4">
              Update your account details and upload a profile picture below. All changes persist to the database.
            </p>

            {msg.text && (
              <div className={`alert alert-${msg.type} py-2.5 px-3 mb-4 bg-dark border-${msg.type} text-${msg.type}`}>
                <i className={`bi ${msg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              {/* Photo Upload Section */}
              <div className="mb-4 p-3 bg-dark rounded-3 border border-secondary">
                <label className="form-label text-offwhite fw-semibold mb-2">
                  Upload Profile Photo (Bootstrap SVG Default)
                </label>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src={activePhoto}
                    alt="Uploaded Avatar Preview"
                    className="rounded-circle border border-2 border-orange p-1 shadow-lg bg-dark"
                    style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control bg-dark text-white border-secondary"
                      onChange={handlePhotoUpload}
                    />
                    <small className="text-offwhite d-block mt-1 font-mono" style={{ fontSize: '0.78rem' }}>
                      Select a photo file from your device (PNG, JPG, WEBP).
                    </small>
                  </div>
                </div>

                <div className="pt-2 border-top border-secondary-subtle">
                  <label className="form-label text-offwhite small fw-semibold">Or Image URL</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white border-secondary"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Custom image URL..."
                  />
                </div>
              </div>

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
                <label className="form-label text-offwhite fw-semibold">Bio / Statement</label>
                <textarea
                  className="form-control bg-dark text-white border-secondary"
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Platform Administrator & Instructor..."
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label text-offwhite fw-semibold">Specialization / Categories</label>
                <input
                  type="text"
                  className="form-control bg-dark text-white border-secondary"
                  value={favoriteTopics}
                  onChange={(e) => setFavoriteTopics(e.target.value)}
                  placeholder="e.g. Python, Systems Design, DSA Evaluation"
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
                    <i className="bi bi-cloud-arrow-up-fill fs-5"></i>
                    Save & Update Database
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Profile / Admin Card */}
        <div className="col-lg-6">
          <div className="rounded-box h-100 d-flex flex-column justify-content-between position-relative overflow-hidden" style={{ border: '1px solid var(--accent-orange-light)' }}>
            <div className="position-absolute top-0 end-0 p-3 opacity-10">
              <i className="bi bi-shield-lock-fill text-orange" style={{ fontSize: '10rem' }}></i>
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
                <span className="badge bg-orange-glow text-orange px-3 py-1 font-mono">
                  {user?.is_admin ? 'ADMIN CARD' : 'OFFICIAL O(Py) BADGE'}
                </span>
                <span className="text-offwhite small font-mono">
                  {user?.is_admin ? 'Platform Administrator' : 'Verified Practitioner'}
                </span>
              </div>

              {/* Avatar & Info */}
              <div className="d-flex align-items-center gap-4 mb-4">
                <img
                  src={activePhoto}
                  alt={fullName}
                  className="rounded-circle border border-2 border-orange p-1 shadow-lg bg-dark"
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

              {/* Stats Row: Omitted for Admin */}
              {!user?.is_admin && (
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
              )}

              {/* Bio Quote */}
              <div className="p-3 bg-dark rounded-3 border border-secondary mb-3">
                <small className="text-orange font-mono d-block mb-1">
                  {user?.is_admin ? 'Administrator Statement:' : 'Bio / Practitioner Statement:'}
                </small>
                <p className="text-white mb-0 italic" style={{ fontSize: '0.95rem' }}>
                  "{bio}"
                </p>
              </div>

              {/* Topics */}
              <div className="mb-3">
                <small className="text-offwhite d-block mb-2 font-mono">Specialization / Categories:</small>
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
                {copiedShare ? 'Copied Card Summary to Clipboard!' : (user?.is_admin ? 'Share Admin Card' : 'Share Profile Card with Friends')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
