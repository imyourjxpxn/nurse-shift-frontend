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
    handleDeleteWard,
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
          onBack={handleBackNavigation}
          onToggleCode={() => setShowCode(!showCode)}
          onCopyCode={handleCopyCode}
        />

        {/* Role-based toolbar */}
        <div className="mb-4 flex flex-wrap items-start justify-end gap-4">
          {isHeadNurse ? (
            <HeadNurseToolbar
              hasUnsavedChanges={hasUnsavedChanges}
              onSwapHistory={() => alert('Swap history coming soon')}
              onClear={handleClear}
              onExport={() => alert('Export functionality coming soon')}
              onSave={handleSave}
              onDelete={() => setDeleteModalOpen(true)}
            />
          ) : (
            <NurseToolbar
              onMySwapRequest={() => alert('My Swap Request coming soon')}
              onApproveSwap={() =>
                alert('Approve Swap Request coming soon')
              }
              onExport={() => alert('Export functionality coming soon')}
            />
          )}
        </div>

        <WardMonthSelector month={ward.month} year={ward.year} />

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
          onCellClick={handleCellClick}
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
    </div>
  )
}
