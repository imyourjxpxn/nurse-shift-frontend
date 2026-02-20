'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Header } from '@/components/header'
import { WardHeader } from '@/components/ward/ward-header'
import { HeadNurseToolbar } from '@/components/ward/head-nurse-toolbar'
import { NurseToolbar } from '@/components/ward/nurse-toolbar'
import { WardMonthSelector } from '@/components/ward/ward-month-selector'
import { WardNurseCounts } from '@/components/ward/ward-nurse-counts'
import { WardShiftConfigs } from '@/components/ward/ward-shift-configs'
import { ScheduleGrid } from '@/components/ward/schedule-grid'
import { ShiftSummary } from '@/components/ward/shift-summary'
import { ShiftSelectorModal } from '@/components/modals/shift-selector-modal'
import { DeleteWardModal } from '@/components/modals/delete-ward-modal'
import { UnsavedChangesModal } from '@/components/modals/unsaved-changes-modal'
import { CreateSwapRequestModal } from '@/components/modals/create-swap-request-modal'
import { MySwapRequestsModal } from '@/components/ward/my-swap-requests'
import { ApproveSwapRequestsModal } from '@/components/ward/approve-swap-requests'
import { SwapHistoryModal } from '@/components/modals/swap-history-modal'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

import { useWardPage } from '@/hooks/use-ward-page'

export default function WardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const wardPage = useWardPage()

  const {
    user,
    isAuthenticated,
    isHydrated,
    ward,
    displayWard,
    userRole,
    isHeadNurse,
    isCreator,
    hasUnsavedChanges,
    showCode,
    setShowCode,
    copied,
    handleCopyCode,
    shiftSelectorOpen,
    setShiftSelectorOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    unsavedModalOpen,
    setUnsavedModalOpen,
    selectedCell,
    handleSave,
    handleClear,
    handleBackNavigation,
    handleShiftConfigChange,
    handleNursesRequiredChange,
    handleShiftSelect,
    handleMonthChange,
    handleYearChange,
    handleRenameWard,
    handleDeleteWard,
    removeMemberTarget,
    setRemoveMemberTarget,
    handleRemoveMember,
    createSwapOpen,
    setCreateSwapOpen,
    mySwapRequestsOpen,
    setMySwapRequestsOpen,
    approveSwapOpen,
    setApproveSwapOpen,
    currentMember,
    handleNurseCellClick,
    handleSwapSubmit,
    swapValidationMsg,
    swapCellInfo,
    pendingSwapPopup,
    setPendingSwapPopup,
    handleApproveSwap,
    swapHistoryOpen,
    setSwapHistoryOpen,
  } = wardPage

  // ✅ Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ Redirect safely (no render side-effects)
  useEffect(() => {
    if (mounted && isHydrated && user && !userRole) {
      router.replace('/home')
    }
  }, [mounted, isHydrated, user, userRole, router])

  // --- Safe guards ---
  if (!mounted) return null
  if (!isAuthenticated || !user) return null
  if (!isHydrated) return null
  if (!ward || !displayWard) return null
  if (!userRole) return null

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-20">
        <WardHeader
          hospitalName={ward.hospitalName}
          wardName={ward.name}
          wardCode={ward.code}
          showCode={showCode}
          copied={copied}
          isHeadNurse={isHeadNurse}
          isCreator={isCreator}
          onBack={handleBackNavigation}
          onToggleCode={() => setShowCode(!showCode)}
          onCopyCode={handleCopyCode}
          onRename={handleRenameWard}
        />

        <div className="mb-4 flex flex-wrap items-start justify-end gap-4">
          {isHeadNurse ? (
            <HeadNurseToolbar
              hasUnsavedChanges={hasUnsavedChanges}
              onSwapHistory={() => setSwapHistoryOpen(true)}
              onClear={handleClear}
              onExport={() => alert('Export functionality coming soon')}
              onSave={handleSave}
              onDelete={() => setDeleteModalOpen(true)}
            />
          ) : (
            <NurseToolbar
              onMySwapRequest={() => setMySwapRequestsOpen(true)}
              onApproveSwap={() => setApproveSwapOpen(true)}
              onExport={() => alert('Export functionality coming soon')}
            />
          )}
        </div>

        <WardMonthSelector
          month={ward.month}
          year={ward.year}
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
        />

        <WardNurseCounts
          shifts={displayWard.shifts}
          disabled={!isHeadNurse}
          onNursesRequiredChange={handleNursesRequiredChange}
        />

        <WardShiftConfigs
          shifts={displayWard.shifts}
          disabled={!isHeadNurse}
          onShiftConfigChange={handleShiftConfigChange}
        />

        <ScheduleGrid
          ward={displayWard}
          isHeadNurse={isHeadNurse}
          isCreator={isCreator}
          onCellClick={handleNurseCellClick}
          onRemoveMember={(id, name) =>
            setRemoveMemberTarget({ id, name })
          }
        />

        <ShiftSummary ward={displayWard} />
      </main>

      {/* --- Modals --- */}

      <ShiftSelectorModal
        open={shiftSelectorOpen}
        onOpenChange={setShiftSelectorOpen}
        onSelect={handleShiftSelect}
        currentShift={selectedCell?.currentShift || ''}
        shifts={displayWard.shifts}
      />

      <DeleteWardModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        wardName={ward.name}
        onDelete={handleDeleteWard}
      />

      <UnsavedChangesModal
        open={unsavedModalOpen}
        onOpenChange={setUnsavedModalOpen}
        onDiscard={() => {
          setUnsavedModalOpen(false)
          router.push('/home')
        }}
        onSave={() => {
          handleSave()
          setUnsavedModalOpen(false)
          router.push('/home')
        }}
      />

      {swapValidationMsg && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-red-600 px-6 py-3 text-sm font-medium text-white shadow-lg">
          {swapValidationMsg}
        </div>
      )}
      
      {currentMember && (
        <>
          <CreateSwapRequestModal
            open={createSwapOpen}
            onOpenChange={setCreateSwapOpen}
            onSubmit={handleSwapSubmit}
            currentMemberId={currentMember.id}
            members={displayWard.members}
            schedules={displayWard.schedules}
            month={ward.month}
            year={ward.year}
            initialDate={swapCellInfo?.date}
            initialShift={swapCellInfo?.shift}
          />

          <MySwapRequestsModal
            open={mySwapRequestsOpen}
            onOpenChange={setMySwapRequestsOpen}
            wardId={ward.id}
            memberId={currentMember.id}
            month={ward.month}
            year={ward.year}
          />

          <ApproveSwapRequestsModal
            open={approveSwapOpen}
            onOpenChange={setApproveSwapOpen}
            wardId={ward.id}
            memberId={currentMember.id}
            month={ward.month}
            year={ward.year}
            onApproveSwap={handleApproveSwap}
          />
        </>
      )}

      <SwapHistoryModal
        open={swapHistoryOpen}
        onOpenChange={setSwapHistoryOpen}
        wardId={ward.id}
        currentMemberId={currentMember?.id}
        month={ward.month}
        year={ward.year}
      />

      {/* Remove member dialog */}
      <AlertDialog
        open={!!removeMemberTarget}
        onOpenChange={(open) => !open && setRemoveMemberTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>{removeMemberTarget?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setRemoveMemberTarget(null)}
            >
              Cancel
            </AlertDialogAction>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pending swap dialog */}
      <AlertDialog
        open={!!pendingSwapPopup}
        onOpenChange={(open) => !open && setPendingSwapPopup(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Swap Request in Progress</AlertDialogTitle>
            <AlertDialogDescription>
              This shift is involved in a pending swap between{' '}
              <strong>{pendingSwapPopup?.fromNurseName}</strong> and{' '}
              <strong>{pendingSwapPopup?.toNurseName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setPendingSwapPopup(null)}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}