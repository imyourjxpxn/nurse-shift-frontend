import { mockSwapRequests, SwapRequest } from '@/mocks/swapRequests'

/** Get swap requests sent BY a specific nurse */
export async function getMySwapRequests(
  wardId: string,
  memberId: string,
): Promise<SwapRequest[]> {
  return mockSwapRequests.filter(
    (r) => r.wardId === wardId && r.fromNurseId === memberId,
  )
}

/** Get incoming swap requests FOR a specific nurse (pending only for approve view) */
export async function getIncomingSwapRequests(
  wardId: string,
  memberId: string,
): Promise<SwapRequest[]> {
  return mockSwapRequests.filter(
    (r) =>
      r.wardId === wardId &&
      r.toNurseId === memberId &&
      r.status === 'pending',
  )
}


/** Get ALL swap requests in a ward (for head nurse swap history) */
export async function getAllSwapRequests(wardId: string): Promise<SwapRequest[]> {
  return mockSwapRequests.filter((r) => r.wardId === wardId)
}

/** Get approved swap requests for a ward+month (for history log) sorted latest first */
export async function getApprovedSwapRequests(
  wardId: string,
  month: number,
  year: number,
): Promise<SwapRequest[]> {
  return mockSwapRequests
    .filter((r) => r.wardId === wardId && r.month === month && r.year === year && r.status === 'approved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/** Create a new swap request */
export async function createSwapRequest(data: {
  wardId: string
  fromNurseId: string
  fromNurseName: string
  toNurseId: string
  toNurseName: string
  fromDate: number
  toDate: number
  fromShiftCode: string
  toShiftCode: string
  reason: string
  month: number
  year: number
}): Promise<SwapRequest> {
  const newRequest: SwapRequest = {
    id: crypto.randomUUID(),
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  // ✅ mutate instead of reassign
  mockSwapRequests.push(newRequest)

  return newRequest
}

/** Approve a swap request */
export async function approveSwapRequest(
  requestId: string,
): Promise<SwapRequest | null> {
  const request = mockSwapRequests.find((r) => r.id === requestId)
  if (!request) return null

  request.status = 'approved'
  return request
}

/** Reject a swap request */
export async function rejectSwapRequest(
  requestId: string,
): Promise<SwapRequest | null> {
  const request = mockSwapRequests.find((r) => r.id === requestId)
  if (!request) return null

  request.status = 'rejected'
  return request
}

/** Cancel a swap request */
export async function cancelSwapRequest(
  requestId: string,
): Promise<SwapRequest | null> {
  const request = mockSwapRequests.find((r) => r.id === requestId)
  if (!request) return null

  request.status = 'cancelled'
  return request
}

/** Locked cells for pending swaps */
export interface LockedCell {
  memberId: string
  date: number
  fromNurseName: string
  toNurseName: string
}

export async function getPendingSwapCells(
  wardId: string,
  month: number,
  year: number,
): Promise<LockedCell[]> {
  const pending = mockSwapRequests.filter(
    (r) =>
      r.wardId === wardId &&
      r.month === month &&
      r.year === year &&
      r.status === 'pending',
  )

  const cells: LockedCell[] = []

  for (const r of pending) {
    cells.push({
      memberId: r.fromNurseId,
      date: r.fromDate,
      fromNurseName: r.fromNurseName,
      toNurseName: r.toNurseName,
    })

    cells.push({
      memberId: r.toNurseId,
      date: r.toDate,
      fromNurseName: r.fromNurseName,
      toNurseName: r.toNurseName,
    })
  }

  return cells
}
