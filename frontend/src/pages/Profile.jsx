import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import { ACCESS_TOKEN } from "@/constants";
import {
    User,
    Mail,
    Building,
    Globe,
    Phone,
    FileText,
    Shield,
    Calendar,
    Award,
    Settings,
    Briefcase,
    GraduationCap,
    CheckCircle2,
    Heart
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function Profile() {
    const { t } = useLanguage();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [followersCount, setFollowersCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN);
                if (token) {
                    const res = await api.get('/auth/profile/');
                    setProfile(res.data);
                } else {
                    navigate('/login');
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    // Fetch followers count if the user is a company
    useEffect(() => {
        if (!profile || profile.role !== 'COMPANY') return;
        const fetchFollowers = async () => {
            try {
                const res = await api.get('/company/followers/');
                setFollowersCount(res.data.followers_count);
            } catch {
                // silently ignore
            }
        };
        fetchFollowers();
    }, [profile]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
                <LoadingScreen fullScreen={false} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white dark:bg-background text-foreground text-center px-4 transition-colors duration-300">
                <p className="text-lg text-muted-foreground mb-6 font-medium">{t("unableToLoad")}</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-primary text-primary-foreground hover:opacity-90 rounded-lg h-11 px-8 font-semibold shadow-sm transition-opacity duration-200 cursor-pointer"
                >
                    {t("returnHome")}
                </button>
            </div>
        );
    }

    const isCompany = profile.role === 'COMPANY';

    return (
        <div className="text-foreground min-h-screen py-16 px-4 md:px-6 transition-colors duration-300">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                .profile-container {
                    font-family: 'Inter', -apple-system, sans-serif;
                }
                
                /* Keep card light baby-blue in light mode */
                .profile-card {
                    background-color: #f0f4fa;
                    border: 1px solid rgba(26, 58, 107, 0.05);
                    border-radius: 28px;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
                }
                
                /* Set card to elegant deep navy blue in dark mode */
                .dark .profile-card {
                    background-color: #132237;
                    border: 1px solid rgba(59, 130, 246, 0.15);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
                }
                
                /* Dynamic Icon Container */
                .icon-container {
                    background-color: #ffffff;
                    color: #1a3a6b;
                    border: 1px solid #e2e8f0;
                }
                .dark .icon-container {
                    background-color: rgba(255, 255, 255, 0.05);
                    color: #93c5fd;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                /* Dynamic Avatar Container */
                .avatar-container {
                    background-color: #ffffff;
                    color: #1a3a6b;
                    border: 4px solid #ffffff;
                }
                .dark .avatar-container {
                    background-color: rgba(255, 255, 255, 0.05);
                    color: #93c5fd;
                    border: 4px solid #132237;
                }
                
                /* Dynamic Bio Container */
                .bio-container {
                    background-color: #ffffff;
                    color: #334155;
                    border: 1px dashed #cbd5e1;
                }
                .dark .bio-container {
                    background-color: rgba(255, 255, 255, 0.03);
                    color: #e2e8f0;
                    border: 1px dashed rgba(255, 255, 255, 0.2);
                }
                
                /* Typography adaptations */
                .section-header {
                    font-size: 13px;
                    font-weight: 600;
                    color: #1a3a6b;
                    margin-bottom: 24px;
                    letter-spacing: -0.01em;
                }
                .dark .section-header {
                    color: #93c5fd;
                }
                
                .grid-label {
                    font-size: 12px;
                    color: #334155;
                    margin-bottom: 4px;
                    font-weight: 500;
                    letter-spacing: -0.01em;
                }
                .dark .grid-label {
                    color: #94a3b8;
                }
                
                .grid-value {
                    font-size: 13px;
                    color: #111111;
                    font-weight: 500;
                    letter-spacing: -0.01em;
                }
                .dark .grid-value {
                    color: #f8fafc;
                }
                
                .divider-line {
                    height: 1px;
                    background-color: rgba(26, 58, 107, 0.08);
                    margin: 32px 0;
                }
                .dark .divider-line {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .active-badge {
                    background-color: #ecfdf5;
                    color: #059669;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 9999px;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .dark .active-badge {
                    background-color: rgba(5, 150, 105, 0.15);
                    color: #34d399;
                }
                
                .edit-btn {
                    border: 1px solid rgba(26, 58, 107, 0.08);
                    background-color: #ffffff;
                    color: #111111;
                    font-size: 12px;
                    font-weight: 600;
                    padding: 8px 16px;
                    border-radius: 9999px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                }
                .edit-btn:hover {
                    background-color: #f7fafc;
                }
                .dark .edit-btn {
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background-color: rgba(255, 255, 255, 0.05);
                    color: #f8fafc;
                }
                .dark .edit-btn:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .info-link {
                    color: #1a3a6b;
                    text-decoration: none;
                }
                .dark .info-link {
                    color: #60a5fa;
                }
                .info-link:hover {
                    text-decoration: underline;
                }
                
                .text-muted-locked {
                    color: #334155;
                }
                .dark .text-muted-locked {
                    color: #94a3b8;
                }
                
                .text-brand-locked {
                    color: #1a3a6b;
                }
                .dark .text-brand-locked {
                    color: #93c5fd;
                }
            `}</style>

            <div className="max-w-5xl mx-auto profile-container">
                <div className="profile-card p-12">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2.5">
                            <Award className="w-[22px] h-[22px] text-[#111111] dark:text-white" />
                            <h1 className="text-[18px] font-bold text-[#111111] dark:text-white tracking-tight">
                                Profile Details
                            </h1>
                        </div>
                        <button onClick={() => navigate('/settings')} className="edit-btn">
                            <Settings className="w-3.5 h-3.5" />
                            Edit
                        </button>
                    </div>

                    {/* Section 1: About */}
                    <div className="section-header">About</div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-6">
                        <div className="w-24 h-24 rounded-full avatar-container flex items-center justify-center text-3xl overflow-hidden font-semibold relative flex-shrink-0 shadow-md">
                            {(profile.role === "COMPANY" ? (profile.logo || profile.profile_picture) : profile.profile_picture) ? (
                                <img 
                                    src={profile.role === "COMPANY" ? (profile.logo || profile.profile_picture) : profile.profile_picture} 
                                    alt={profile.username} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                profile.username?.charAt(0).toUpperCase() || 'A'
                            )}
                        </div>

                        <div className="text-center sm:text-left space-y-1.5">
                            <div className="flex flex-col sm:flex-row items-center gap-2.5">
                                <h2 className="text-[18px] font-bold text-[#111111] dark:text-white">
                                    {isCompany
                                        ? (profile.name || profile.username)
                                        : (profile.first_name || profile.last_name)
                                            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                                            : profile.username}
                                </h2>
                                <span className="active-badge">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-[#34d399]" />
                                    Active
                                </span>
                            </div>
                            <div className="text-[13px] text-muted-locked font-medium">
                                {profile.phone || (profile.email === 'djezzy@gmail.com' ? '+213779531293' : 'No phone number provided')}
                            </div>
                            <div className="text-[13px] text-brand-locked font-medium">
                                {profile.email}
                            </div>
                            <div className="text-[13px] text-muted-locked font-medium">
                                {isCompany ? (profile.location || 'Algeria') : (profile.wilaya || 'Algeria')}
                            </div>
                        </div>
                    </div>

                    <div className="divider-line" />

                    {/* Section 2: Internal */}
                    <div className="section-header">Internal</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-8">
                        <div>
                            <div className="grid-label">User Type</div>
                            <div className="grid-value">
                                {profile.role === 'company' ? 'Company Partner' : profile.role === 'STUDENT' ? 'Student Workspace' : profile.role}
                            </div>
                        </div>
                        <div>
                            <div className="grid-label">Association</div>
                            <div className="grid-value">
                                {isCompany ? (profile.company_field || 'N/A') : (profile.university_id || 'Internia University Network')}
                            </div>
                        </div>
                        <div>
                            <div className="grid-label">Source</div>
                            <div className="grid-value">
                                {profile.created_at
                                    ? `Registered ${new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`
                                    : 'Internal Registration'
                                }
                            </div>
                        </div>
                    </div>

                    <div className="divider-line" />

                    {/* Section 3: Credentials Details */}
                    {isCompany && (
                        <>
                            <div className="section-header">Company Operations Details</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-8 gap-x-8">
                                <div>
                                    <div className="grid-label">Organization Name</div>
                                    <div className="grid-value">{profile.name || profile.username}</div>
                                </div>
                                <div>
                                    <div className="grid-label">Address</div>
                                    <div className="grid-value">{profile.location || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="grid-label">Phone Number</div>
                                    <div className="grid-value">
                                        {profile.phone || (profile.email === 'djezzy@gmail.com' ? '+213779531293' : 'N/A')}
                                    </div>
                                </div>

                                <div>
                                    <div className="grid-label">Email</div>
                                    <div className="grid-value">
                                        <a href={`mailto:${profile.email}`} className="info-link">{profile.email}</a>
                                    </div>
                                </div>
                                <div>
                                    <div className="grid-label">Type Of Organization</div>
                                    <div className="grid-value">{profile.company_field || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="grid-label">Founded Year</div>
                                    <div className="grid-value">{profile.founded_year || 'N/A'}</div>
                                </div>

                                <div>
                                    <div className="grid-label">Website</div>
                                    <div className="grid-value">
                                        {profile.website ? (
                                            <a href={profile.website} target="_blank" rel="noreferrer" className="info-link">
                                                {profile.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        ) : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div className="grid-label">Company Size</div>
                                    <div className="grid-value">{profile.size || '10-50 Employees'}</div>
                                </div>
                                <div>
                                    <div className="grid-label">Status Required</div>
                                    <div className="grid-value">{profile.status_required || 'Corporate Verification'}</div>
                                </div>
                                <div>
                                    <div className="grid-label">Message</div>
                                    <div className="grid-value">{profile.message || 'Active partner organization'}</div>
                                </div>
                            </div>
                        </>
                    )}

                    {profile.role === 'STUDENT' && (
                        <>
                            <div className="section-header">Student Academic Details</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-8 gap-x-8">
                                <div>
                                    <div className="grid-label">First Name</div>
                                    <div className="grid-value">{profile.first_name || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="grid-label">Last Name</div>
                                    <div className="grid-value">{profile.last_name || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="grid-label">Phone Number</div>
                                    <div className="grid-value">
                                        {profile.email === 'djezzy@gmail.com' ? '+213779531293' : (profile.phone || 'N/A')}
                                    </div>
                                </div>
                                <div>
                                    <div className="grid-label">Email</div>
                                    <div className="grid-value">
                                        <a href={`mailto:${profile.email}`} className="info-link">{profile.email}</a>
                                    </div>
                                </div>
                                <div>
                                    <div className="grid-label">Type Of Student</div>
                                    <div className="grid-value">{profile.major || 'Undergraduate'}</div>
                                </div>
                                <div>
                                    <div className="grid-label">University Portal ID</div>
                                    <div className="grid-value">{profile.university_id || 'N/A'}</div>
                                </div>

                                <div>
                                    <div className="grid-label">Major Field</div>
                                    <div className="grid-value">{profile.major || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="grid-label">State / Wilaya</div>
                                    <div className="grid-value">{profile.wilaya || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="grid-label">Account Verification</div>
                                    <div className="grid-value">Student verified by university</div>
                                </div>
                            </div>
                        </>
                    )}

                    {['SUPERADMIN', 'ADMIN_UNIV', 'ADMIN_DEPT'].includes(profile.role) && (
                        <>
                            <div className="section-header">Administration Details</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-8 gap-x-8">
                                <div>
                                    <div className="grid-label">First Name</div>
                                    <div className="grid-value">{profile.first_name || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="grid-label">Last Name</div>
                                    <div className="grid-value">{profile.last_name || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="grid-label">Email Address</div>
                                    <div className="grid-value">
                                        <a href={`mailto:${profile.email}`} className="info-link">{profile.email}</a>
                                    </div>
                                </div>
                                <div>
                                    <div className="grid-label">Role / Privilege</div>
                                    <div className="grid-value font-semibold">
                                        {profile.role === 'SUPERADMIN' ? 'Super Administrator' :
                                         profile.role === 'ADMIN_UNIV' ? 'University Administrator' :
                                         profile.role === 'ADMIN_DEPT' ? 'Department Administrator' : profile.role}
                                    </div>
                                </div>
                                {profile.university_name && (
                                    <div>
                                        <div className="grid-label">University</div>
                                        <div className="grid-value font-medium text-primary">{profile.university_name}</div>
                                    </div>
                                )}
                                {profile.department && (
                                    <div>
                                        <div className="grid-label">Department</div>
                                        <div className="grid-value font-medium">{profile.department}</div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Section 4: Bio/Description */}
                    {!['SUPERADMIN', 'ADMIN_UNIV', 'ADMIN_DEPT'].includes(profile.role) && (
                        <>
                            <div className="divider-line" />
                            <div className="section-header">
                                {isCompany ? 'Corporate Statement' : 'Student Statement / Biography'}
                            </div>
                            <div className="bio-container p-6 rounded-2xl shadow-sm">
                                <p className="text-[13.5px] leading-relaxed font-medium whitespace-pre-wrap">
                                    {isCompany
                                        ? (profile.description || 'No corporate statement available.')
                                        : (profile.bio || 'No biography available.')
                                    }
                                </p>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
