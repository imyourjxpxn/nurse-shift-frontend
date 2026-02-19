'use client'

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
    handleCellClick,
    handleShiftSelect,
    handleMonthChange,
    handleYearChange,
    handleRenameWard,
    handleDeleteWard,

    // Remove member
    removeMemberTarget,
    setRemoveMemberTarget,
    handleRemoveMember,

    // Swap modals
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

    router,
  } = useWardPage()

  // --- Guard renders ---
  if (!isAuthenticated || !user) return null

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    )
  }

  if (!ward || !displayWard) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-muted-foreground">Ward not found</p>
        </main>
      </div>
    )
  }

  if (!userRole) {
    router.replace('/home')
    return null
  }

  // --- Main layout ---
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

        {/* Role-based toolbar */}
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
          onRemoveMember={(memberId, memberName) => setRemoveMemberTarget({ id: memberId, name: memberName })}
        />

        <ShiftSummary ward={displayWard} />
      </main>

      {/* Modals */}
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

      {/* Swap validation toast */}
      {swapValidationMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-red-600 px-6 py-3 text-sm font-medium text-white shadow-lg">
          {swapValidationMsg}
        </div>
      )}

      {/* Swap modals (nurse role) */}
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

      {/* Swap History sidebar (head nurse only) */}
      <SwapHistoryModal
        open={swapHistoryOpen}
        onOpenChange={setSwapHistoryOpen}
        wardId={ward.id}
        currentMemberId={currentMember?.id}
        month={ward.month}
        year={ward.year}
      />

      {/* Remove member confirmation */}
      <AlertDialog open={!!removeMemberTarget} onOpenChange={(open) => !open && setRemoveMemberTarget(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {'Are you sure you want to remove '}
                  <span className="font-semibold text-foreground">{removeMemberTarget?.name}</span>
                  {' from this ward?'}
                </p>
                <p>This will remove them from the schedule and cancel all their pending swap requests. Approved and rejected swap history will be preserved.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogAction
              onClick={() => setRemoveMemberTarget(null)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Cancel
            </AlertDialogAction>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pending swap popup */}
      <AlertDialog open={!!pendingSwapPopup} onOpenChange={(open) => !open && setPendingSwapPopup(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Swap Request in Progress</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {'This shift is currently involved in a pending swap request between '}
                  <span className="font-semibold text-foreground">{pendingSwapPopup?.fromNurseName}</span>
                  {' and '}
                  <span className="font-semibold text-foreground">{pendingSwapPopup?.toNurseName}</span>
                  {'.'}
                </p>
                <p>Approval is in progress. You cannot create another request.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setPendingSwapPopup(null)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


