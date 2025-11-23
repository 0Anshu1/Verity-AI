import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { invitationService } from '../services/invitations'
import type { CustomerSubmission } from '../types'
import { 
  Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, AlertCircle,
  MoreVertical
} from 'lucide-react'

/**
 * ORGANIZATION-FACING PAGE
 * Dashboard for organization to review customer KYC submissions
 * Only authenticated org admins can see this
 * Shows all customer submissions with ability to approve/reject
 */
const KYCSubmissionsManagement: React.FC = () => {
  const navigate = useNavigate()
  const { user, organization } = useAuthStore()

  const [submissions, setSubmissions] = useState<CustomerSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<CustomerSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'approved' | 'rejected' | 'needs_review'>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<CustomerSubmission | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    needsReview: 0,
  })

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!organization) return

      try {
        // TODO: getSubmissions endpoint not yet implemented on backend
        // const subs = await invitationService.getSubmissions(organization.id)
        // setSubmissions(subs)

        // TODO: getSubmissionStats endpoint not yet implemented on backend
        // const statsData = await invitationService.getSubmissionStats(organization.id)
        // setStats(statsData)

        setLoading(false)
      } catch (err) {
        console.error('Failed to load submissions', err)
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [organization])

  // Filter submissions based on search and status
  useEffect(() => {
    let filtered = submissions

    if (searchTerm) {
      filtered = filtered.filter(
        sub =>
          sub.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === filterStatus)
    }

    setFilteredSubmissions(filtered)
  }, [submissions, searchTerm, filterStatus])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock size={18} style={{ color: '#f59e0b' }} />
      case 'approved':
        return <CheckCircle size={18} style={{ color: '#22c55e' }} />
      case 'rejected':
        return <XCircle size={18} style={{ color: '#ef4444' }} />
      case 'needs_review':
        return <AlertCircle size={18} style={{ color: '#3b82f6' }} />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'rgba(245, 158, 11, 0.1)'
      case 'approved':
        return 'rgba(34, 197, 94, 0.1)'
      case 'rejected':
        return 'rgba(239, 68, 68, 0.1)'
      case 'needs_review':
        return 'rgba(59, 130, 246, 0.1)'
      default:
        return 'var(--bg)'
    }
  }

  const handleApprove = async (submissionId: string) => {
    // TODO: implement approve endpoint on backend
    console.error('Approve not yet implemented on backend')
  }

  const handleReject = async (submissionId: string) => {
    // TODO: implement reject endpoint on backend
    console.error('Reject not yet implemented on backend')
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading submissions...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text)' }}>
              Customer KYC Submissions
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Review and manage customer identity verification applications
            </p>
          </div>

          <button
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
            <Download size={18} />
            Export Report
          </button>
        </div>

        {/* Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          {[
            { label: 'Total Submissions', value: stats.total, color: '#3b82f6' },
            { label: 'Pending Review', value: stats.submitted, color: '#f59e0b' },
            { label: 'Approved', value: stats.approved, color: '#22c55e' },
            { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
            { label: 'Needs Review', value: stats.needsReview, color: '#3b82f6' },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                background: 'var(--bg-secondary)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                borderLeft: `4px solid ${stat.color}`,
              }}
            >
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {stat.label}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.75rem', fontWeight: 'bold', color: stat.color }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <div style={{
              flex: 1,
              minWidth: '250px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg)',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
            }}>
              <Search size={18} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text)',
                  outline: 'none',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              <option value="all">All Status</option>
              <option value="submitted">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="needs_review">Needs Review</option>
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{
                  background: 'var(--bg)',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                  }}>
                    Customer
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                  }}>
                    Email
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                  }}>
                    Risk Level
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                  }}>
                    Submitted
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'center',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map(submission => (
                    <tr
                      key={submission.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <strong style={{ color: 'var(--text)' }}>
                          {submission.customerName || 'Unknown'}
                        </strong>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {submission.customerEmail}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: getStatusColor(submission.status),
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}>
                          {getStatusIcon(submission.status)}
                          {submission.status.replace(/_/g, ' ')}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: submission.riskLevel === 'green'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : submission.riskLevel === 'amber'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}>
                          {submission.riskLevel || 'N/A'}
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                      }}>
                        {submission.submittedAt?.toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setShowDetailModal(true)
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                        >
                          <Eye size={16} />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                    }}>
                      No submissions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>
              Submission Details
            </h3>

            <div style={{
              background: 'var(--bg)',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong style={{ color: 'var(--text)' }}>Customer:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{selectedSubmission.customerName}</span>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong style={{ color: 'var(--text)' }}>Email:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{selectedSubmission.customerEmail}</span>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong style={{ color: 'var(--text)' }}>Phone:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{selectedSubmission.customerPhone}</span>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong style={{ color: 'var(--text)' }}>Submitted:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  {selectedSubmission.submittedAt?.toLocaleString()}
                </span>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong style={{ color: 'var(--text)' }}>Risk Score:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>
                  {selectedSubmission.riskScore}% - {selectedSubmission.riskLevel}
                </span>
              </p>
            </div>

            {selectedSubmission.status === 'submitted' && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => handleApprove(selectedSubmission.id)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedSubmission.id)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Reject
                </button>
              </div>
            )}

            <button
              onClick={() => setShowDetailModal(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                color: 'var(--text)',
                cursor: 'pointer',
                marginTop: '1rem',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default KYCSubmissionsManagement
