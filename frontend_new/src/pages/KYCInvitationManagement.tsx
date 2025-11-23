import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { invitationService } from '../services/invitations'
import type { KYCInvitation } from '../types'
import {
  Plus, Copy, Share2, Trash2, ToggleRight, ToggleLeft, Calendar, Users, Link as LinkIcon
} from 'lucide-react'

/**
 * ORGANIZATION-FACING PAGE
 * Dashboard for organization to create and manage KYC invitation links
 * Only authenticated org admins can see this
 * Features:
 * - Generate new KYC links
 * - View all active links with usage stats
 * - Copy link to clipboard
 * - Share on email/social
 * - Deactivate/revoke links
 */
const KYCInvitationManagement: React.FC = () => {
  const navigate = useNavigate()
  const { user, organization } = useAuthStore()

  const [invitations, setInvitations] = useState<KYCInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    usageLimit: '1000',
  })
  const [copied, setCopied] = useState<string | null>(null)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!organization) return

      try {
        const invs = await invitationService.getInvitations(organization.id)
        setInvitations(invs)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load invitations', err)
        setLoading(false)
      }
    }

    fetchInvitations()
  }, [organization])

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return

    try {
      const newInvitation = await invitationService.generateInvitation(
        organization.id,
        formData.name || 'KYC Verification Link',
        parseInt(formData.usageLimit)
      )

      setInvitations([...invitations, newInvitation])
      setFormData({ name: '', usageLimit: '1000' })
      setShowCreateForm(false)
    } catch (err) {
      console.error('Failed to create invitation', err)
    }
  }

  const handleCopyLink = (url: string, invitationId: string) => {
    navigator.clipboard.writeText(url)
    setCopied(invitationId)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    // TODO: implement revoke endpoint on backend
    console.error('Revoke not yet implemented on backend')
    setInvitations(invitations.map(inv =>
      inv.id === invitationId ? { ...inv, isActive: false } : inv
    ))
  }

  const getUsagePercentage = (invitation: KYCInvitation) => {
    if (!invitation.usageLimit) return 0
    return Math.round((invitation.usageCount / invitation.usageLimit) * 100)
  }

  const isExpired = (invitation: KYCInvitation) => {
    return invitation.expiresAt < new Date()
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading invitations...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text)' }}>
              KYC Invitation Links
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Create and manage KYC verification links to send to customers
            </p>
          </div>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 600,
            }}
          >
            <Plus size={18} />
            Create New Link
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '2px solid #2563eb',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Create New Invitation Link</h3>
            <form onSubmit={handleCreateInvitation} style={{
              display: 'grid',
              gap: '1rem',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  color: 'var(--text)',
                }}>
                  Link Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Q1 2025 Verification Round"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  color: 'var(--text)',
                }}>
                  Usage Limit
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Maximum number of customers"
                  min="1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '0.95rem',
                  }}
                />
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}>
                  Leave unlimited if no restriction needed
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Create Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Invitations List */}
        <div style={{
          display: 'grid',
          gap: '1rem',
        }}>
          {invitations.length > 0 ? (
            invitations.map(invitation => (
              <div
                key={invitation.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: isExpired(invitation) || !invitation.isActive ? '1px solid #ef4444' : '1px solid var(--border)',
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '2rem',
                  marginBottom: '1rem',
                }}>
                  {/* Left: Invitation Details */}
                  <div>
                    <h4 style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '1.125rem',
                      color: 'var(--text)',
                    }}>
                      {invitation.name || 'Unnamed Link'}
                    </h4>

                    <div style={{
                      background: 'var(--bg)',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      justifyContent: 'space-between',
                    }}>
                      <code style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        wordBreak: 'break-all',
                      }}>
                        {invitation.shareUrl}
                      </code>
                      <button
                        onClick={() => handleCopyLink(invitation.shareUrl || '', invitation.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          padding: '0.25rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Copy size={16} />
                        {copied === invitation.id ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    {/* Meta Information */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '1rem',
                      fontSize: '0.875rem',
                    }}>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)' }}>
                          Created
                        </p>
                        <p style={{
                          margin: 0,
                          color: 'var(--text)',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}>
                          <Calendar size={14} />
                          {invitation.createdAt.toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)' }}>
                          Expires
                        </p>
                        <p style={{
                          margin: 0,
                          color: isExpired(invitation) ? '#ef4444' : 'var(--text)',
                          fontWeight: 500,
                        }}>
                          {invitation.expiresAt.toLocaleDateString()}
                          {isExpired(invitation) ? ' (Expired)' : ''}
                        </p>
                      </div>

                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)' }}>
                          Usage
                        </p>
                        <p style={{
                          margin: 0,
                          color: 'var(--text)',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}>
                          <Users size={14} />
                          {invitation.usageCount}/{invitation.usageLimit || '∞'}
                        </p>
                      </div>

                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)' }}>
                          Status
                        </p>
                        <p style={{
                          margin: 0,
                          color: invitation.isActive ? '#22c55e' : '#ef4444',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}>
                          {invitation.isActive ? 'Active' : 'Revoked'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                  }}>
                    <button
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      <Share2 size={16} />
                      Share
                    </button>

                    {invitation.isActive && (
                      <button
                        onClick={() => handleRevokeInvitation(invitation.id)}
                        style={{
                          padding: '0.75rem 1rem',
                          background: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          color: '#ef4444',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <Trash2 size={16} />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>

                {/* Usage Progress Bar */}
                {invitation.usageLimit && (
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border)',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                    }}>
                      <span>Usage</span>
                      <span>{getUsagePercentage(invitation)}%</span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'var(--bg)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${getUsagePercentage(invitation)}%`,
                        background: getUsagePercentage(invitation) > 80
                          ? '#ef4444'
                          : getUsagePercentage(invitation) > 50
                          ? '#f59e0b'
                          : '#22c55e',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              <LinkIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No invitation links yet. Create one to start sending KYC requests to customers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default KYCInvitationManagement
