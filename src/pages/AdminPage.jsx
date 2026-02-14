import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

export default function AdminPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'user' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [createdCredentials, setCreatedCredentials] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        setUsers(data || []);
        setLoading(false);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        // If editing, just update the profile
        if (editingUser) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        full_name: newUser.full_name,
                        role: newUser.role,
                    })
                    .eq('id', editingUser.id);

                if (error) throw error;

                setShowModal(false);
                setEditingUser(null);
                setNewUser({ email: '', password: '', full_name: '', role: 'user' });
                setSaving(false);
                fetchUsers();
            } catch (err) {
                setError(err.message);
                setSaving(false);
            }
            return;
        }

        // Create a temporary client to avoid logging out the admin
        // We MUST use a custom storage to prevent overwriting the main client's session in localStorage
        const tempClient = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                    storage: {
                        getItem: () => null,
                        setItem: () => { },
                        removeItem: () => { },
                    }
                }
            }
        );

        // Sign up the user via temp client
        const { data, error: authError } = await tempClient.auth.signUp({
            email: newUser.email,
            password: newUser.password,
            options: {
                data: {
                    full_name: newUser.full_name,
                    role: newUser.role,
                },
            },
        });

        if (authError) {
            setError(authError.message);
            setSaving(false);
            return;
        }

        // Update profile role manually if needed (although trigger might handle it, we want to be sure)
        if (data?.user) {
            await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    email: newUser.email,
                    full_name: newUser.full_name,
                    role: newUser.role,
                });
        }

        // Show credentials modal
        setCreatedCredentials({
            email: newUser.email,
            password: newUser.password
        });

        setShowModal(false);
        setNewUser({ email: '', password: '', full_name: '', role: 'user' });
        setSaving(false);
        fetchUsers();
    };

    const handleEditUser = (userRow) => {
        setEditingUser(userRow);
        setNewUser({
            email: userRow.email,
            password: '',
            full_name: userRow.full_name || '',
            role: userRow.role
        });
        setShowModal(true);
    };

    const handleDeleteUser = async (userRow) => {
        if (!confirm(t('admin.confirmDelete'))) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userRow.id);

            if (error) throw error;

            fetchUsers();
        } catch (err) {
            alert('Error deleting user: ' + err.message);
        }
    };

    const copyToClipboard = () => {
        const text = `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
        navigator.clipboard.writeText(text);
        alert(t('admin.copied'));
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Layout>
            <div className="page-header">
                <div className="toolbar">
                    <div>
                        <h1>{t('admin.title')}</h1>
                        <p>{t('admin.subtitle')}</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="8" y1="3" x2="8" y2="13" />
                            <line x1="3" y1="8" x2="13" y2="8" />
                        </svg>
                        {t('admin.addUser')}
                    </button>
                </div>
            </div>

            <div className="card">
                {loading ? (
                    <div className="loading-inline"><div className="loading-spinner" /></div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('admin.email')}</th>
                                <th>{t('admin.name')}</th>
                                <th>{t('admin.role')}</th>
                                <th>{t('admin.created')}</th>
                                <th>{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(userRow => (
                                <tr key={userRow.id}>
                                    <td>{userRow.email}</td>
                                    <td>{userRow.full_name || '—'}</td>
                                    <td>
                                        <span className={`role-badge ${userRow.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                                            {userRow.role === 'admin' ? t('admin.roleAdmin') : t('admin.roleUser')}
                                        </span>
                                    </td>
                                    <td>{formatDate(userRow.created_at)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleEditUser(userRow)}
                                                title={t('common.edit')}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 2L14 5L5 14H2V11L11 2Z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="btn-icon btn-danger"
                                                onClick={() => handleDeleteUser(userRow)}
                                                title={t('common.delete')}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M12 4V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4H12Z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit User Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingUser(null); }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingUser ? t('admin.editUserTitle') : t('admin.addUserTitle')}</h2>
                        {error && <div className="login-error">{error}</div>}
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label className="form-label">{t('admin.email')}</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                    disabled={editingUser !== null}
                                />
                            </div>
                            {!editingUser && (
                                <div className="form-group">
                                    <label className="form-label">{t('admin.password')}</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">{t('admin.name')}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newUser.full_name}
                                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('admin.role')}</label>
                                <select
                                    className="form-select"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="user">{t('admin.roleUser')}</option>
                                    <option value="admin">{t('admin.roleAdmin')}</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    {t('admin.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? t('common.loading') : t('admin.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Credentials Modal */}
            {createdCredentials && (
                <div className="modal-overlay">
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{t('admin.credentialsTitle')}</h2>
                        <p style={{ marginBottom: '1rem', color: '#666' }}>
                            {t('admin.credentialsSubtitle')}
                        </p>

                        <div className="credentials-box" style={{ background: '#f5f5f7', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>{t('admin.email')}:</strong> {createdCredentials.email}
                            </div>
                            <div>
                                <strong>{t('admin.password')}:</strong> {createdCredentials.password}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-primary" onClick={copyToClipboard}>
                                {t('admin.copy')}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setCreatedCredentials(null)}>
                                {t('common.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
