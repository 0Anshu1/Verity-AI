import type { KYCInvitation, CustomerSubmission, KYCSession } from '../types'

const API_BASE = (window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin)

async function handleJSON(response: Response) {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API error: ${response.status} ${text}`)
  }
  return response.json()
}

export const invitationService = {
  async getInvitationByCode(code: string): Promise<KYCInvitation | null> {
    const res = await fetch(`${API_BASE}/api/v1/invitations/${encodeURIComponent(code)}`)
    if (res.status === 404) return null
    return handleJSON(res)
  },

  async submitCustomerKYC(invitationCode: string, payload: any, files: File[] = []): Promise<CustomerSubmission> {
    const form = new FormData()
    form.append('data', JSON.stringify(payload))
    files.forEach(f => form.append('files', f))

    const res = await fetch(`${API_BASE}/api/v1/kyc/${encodeURIComponent(invitationCode)}/submissions`, {
      method: 'POST',
      body: form,
    })

    return handleJSON(res)
  },

  // The following methods currently expect backend endpoints to be implemented.
  async generateInvitation(orgId: string, name: string, usageLimit?: number): Promise<KYCInvitation> {
    const res = await fetch(`${API_BASE}/api/v1/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Org-Id': orgId,
      },
      body: JSON.stringify({ name, usage_limit: usageLimit }),
    })
    return handleJSON(res)
  },

  // TODO: implement these when backend list/filter endpoints are available
  async getInvitations(_organizationId: string): Promise<KYCInvitation[]> {
    throw new Error('Not implemented on backend yet')
  },

  async getSubmissions(_organizationId: string): Promise<CustomerSubmission[]> {
    throw new Error('Not implemented on backend yet')
  },

  async updateSubmissionStatus(_submissionId: string, _status: any): Promise<CustomerSubmission> {
    throw new Error('Not implemented on backend yet')
  },
}
